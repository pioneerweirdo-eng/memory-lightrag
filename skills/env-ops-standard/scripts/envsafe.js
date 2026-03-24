#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const DEFAULT_ENV = '/home/node/.openclaw/.env';
const KEY_RE = /^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=/;
const STRICT_KEY_RE = /^[A-Za-z_][A-Za-z0-9_]*$/;

function parseArgs(argv) {
  const out = {
    file: DEFAULT_ENV,
    backupKeep: 20,
    backupTtlDays: 7,
    lockTimeoutMs: 5000,
    dedupe: 'keep-last',
    _: [],
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--file') out.file = argv[++i];
    else if (a === '--stdin') out.stdin = true;
    else if (a === '--allow-argv') out.allowArgv = true;
    else if (a === '--if-missing') out.ifMissing = true;
    else if (a === '--dry-run') out.dryRun = true;
    else if (a === '--backup-keep') out.backupKeep = Number(argv[++i]);
    else if (a === '--backup-ttl-days') out.backupTtlDays = Number(argv[++i]);
    else if (a === '--lock-timeout-ms') out.lockTimeoutMs = Number(argv[++i]);
    else if (a === '--dedupe') out.dedupe = argv[++i] || 'keep-last';
    else out._.push(a);
  }
  return out;
}

function die(msg, code = 2) {
  console.error(msg);
  process.exit(code);
}

function readLines(file) {
  if (!fs.existsSync(file)) return [];
  const txt = fs.readFileSync(file, 'utf8');
  const lines = txt.split(/(?<=\n)/);
  if (lines.length === 1 && lines[0] === '') return [];
  return lines;
}

function buildText(lines) {
  return lines.join('');
}

function writeFileAtomic(file, text) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const tmp = `${file}.tmp.${Date.now()}.${process.pid}`;
  fs.writeFileSync(tmp, text, { encoding: 'utf8', mode: 0o600 });
  fs.renameSync(tmp, file);
  try {
    fs.chmodSync(file, 0o600);
  } catch (_) {}
}

function backupFile(file) {
  const now = new Date();
  const ts = now.toISOString().replace(/[-:]/g, '').replace(/\.\d+Z$/, 'Z');
  const ms = String(now.getUTCMilliseconds()).padStart(3, '0');
  const bak = `${file}.bak.${ts}.${ms}.${process.pid}`;
  if (fs.existsSync(file)) {
    fs.copyFileSync(file, bak);
    try {
      fs.chmodSync(bak, 0o600);
    } catch (_) {}
  } else {
    fs.writeFileSync(bak, '', { encoding: 'utf8', mode: 0o600 });
  }
  return bak;
}

function pruneBackups(file, keep, ttlDays) {
  const dir = path.dirname(file);
  const base = path.basename(file);
  if (!fs.existsSync(dir)) return { deleted: 0, remaining: 0 };

  const now = Date.now();
  const ttlMs = Math.max(0, Number(ttlDays) || 0) * 24 * 60 * 60 * 1000;

  let backups = fs
    .readdirSync(dir)
    .filter((n) => n.startsWith(`${base}.bak.`))
    .map((n) => {
      const p = path.join(dir, n);
      const st = fs.statSync(p);
      return { path: p, mtimeMs: st.mtimeMs };
    })
    .sort((a, b) => b.mtimeMs - a.mtimeMs);

  let deleted = 0;

  // TTL prune first
  if (ttlMs > 0) {
    for (const b of backups) {
      if (now - b.mtimeMs > ttlMs) {
        try {
          fs.unlinkSync(b.path);
          deleted++;
        } catch (_) {}
      }
    }
    backups = backups.filter((b) => fs.existsSync(b.path));
  }

  // Keep newest N
  const keepN = Math.max(0, Number(keep) || 0);
  for (let i = keepN; i < backups.length; i++) {
    try {
      fs.unlinkSync(backups[i].path);
      deleted++;
    } catch (_) {}
  }

  const remaining = fs
    .readdirSync(dir)
    .filter((n) => n.startsWith(`${base}.bak.`)).length;
  return { deleted, remaining };
}

function extractKey(line) {
  const m = line.match(KEY_RE);
  return m ? m[1] : null;
}

function validateKey(key) {
  if (!STRICT_KEY_RE.test(key || '')) die(`invalid key: ${key}`);
}

function listKeys(lines) {
  const out = [];
  for (const ln of lines) {
    const s = ln.trim();
    if (!s || s.startsWith('#')) continue;
    const k = extractKey(ln);
    if (k) out.push(k);
  }
  return out;
}

function normalizeValue(v) {
  if (v.includes('\n')) return JSON.stringify(v);
  return v;
}

function withLock(file, timeoutMs, fn) {
  const lockFile = `${file}.lock`;
  const start = Date.now();

  // Retry loop
  while (true) {
    try {
      const fd = fs.openSync(lockFile, 'wx', 0o600);
      try {
        fs.writeFileSync(fd, String(process.pid));
      } catch (_) {}
      try {
        return fn();
      } finally {
        try {
          fs.closeSync(fd);
        } catch (_) {}
        try {
          fs.unlinkSync(lockFile);
        } catch (_) {}
      }
    } catch (e) {
      if (Date.now() - start > timeoutMs) {
        die(`lock timeout after ${timeoutMs}ms: ${lockFile}`);
      }
      // naive sleep
      Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 100);
    }
  }
}

function cmdKeys(opts) {
  const keys = Array.from(new Set(listKeys(readLines(opts.file)))).sort();
  for (const k of keys) console.log(k);
}

function cmdExists(opts, key) {
  validateKey(key);
  const keys = new Set(listKeys(readLines(opts.file)));
  console.log(keys.has(key) ? 'present' : 'missing');
}

function lintFindings(file) {
  const lines = readLines(file);
  const seen = new Map();
  const invalidLines = [];
  lines.forEach((ln, i) => {
    const n = i + 1;
    const s = ln.trim();
    if (!s || s.startsWith('#')) return;
    const k = extractKey(ln);
    if (!k) {
      invalidLines.push(n);
      return;
    }
    if (!seen.has(k)) seen.set(k, []);
    seen.get(k).push(n);
  });

  const duplicates = [];
  for (const [k, locs] of seen.entries()) {
    if (locs.length > 1) duplicates.push({ key: k, lines: locs });
  }

  return {
    invalidLines,
    duplicates,
    keyCount: seen.size,
    assignmentCount: [...seen.values()].reduce((a, x) => a + x.length, 0),
  };
}

function cmdLint(opts) {
  const f = lintFindings(opts.file);
  for (const n of f.invalidLines) console.log(`line ${n}: invalid assignment syntax`);
  for (const d of f.duplicates) console.log(`duplicate key ${d.key} at lines ${d.lines.join(',')}`);
  if (f.invalidLines.length || f.duplicates.length) process.exit(2);
  console.log('OK');
}

function applySet(lines, key, value, dedupeMode, ifMissing) {
  const newline = `${key}=${value}\n`;
  const idxs = [];
  for (let i = 0; i < lines.length; i++) {
    if (extractKey(lines[i]) === key) idxs.push(i);
  }

  const out = [...lines];
  let changed = 0;
  let removed = 0;
  let skipped = 0;

  if (idxs.length === 0) {
    if (out.length > 0 && !out[out.length - 1].endsWith('\n')) out[out.length - 1] += '\n';
    out.push(newline);
    changed++;
    return { out, changed, removed, skipped };
  }

  if (ifMissing) {
    skipped = 1;
    return { out, changed, removed, skipped };
  }

  if (dedupeMode === 'none') {
    for (const i of idxs) {
      if (out[i] !== newline) {
        out[i] = newline;
        changed++;
      }
    }
    return { out, changed, removed, skipped };
  }

  const keepIndex = dedupeMode === 'keep-first' ? idxs[0] : idxs[idxs.length - 1];
  const removedSet = new Set(idxs.filter((i) => i !== keepIndex));
  const deduped = [];
  for (let i = 0; i < out.length; i++) {
    if (removedSet.has(i)) {
      removed++;
      continue;
    }
    deduped.push(out[i]);
  }

  // find key line index again after dedupe
  let keyLine = -1;
  for (let i = 0; i < deduped.length; i++) {
    if (extractKey(deduped[i]) === key) {
      keyLine = i;
      break;
    }
  }
  if (keyLine >= 0 && deduped[keyLine] !== newline) {
    deduped[keyLine] = newline;
    changed++;
  }

  return { out: deduped, changed, removed, skipped };
}

function cmdSet(opts, key, valueArg) {
  validateKey(key);
  if (!['keep-last', 'keep-first', 'none'].includes(opts.dedupe)) {
    die(`invalid --dedupe value: ${opts.dedupe}`);
  }

  let value;
  if (opts.stdin) {
    value = fs.readFileSync(0, 'utf8');
    if (value.endsWith('\n')) value = value.slice(0, -1);
  } else {
    if (!opts.allowArgv) {
      die('argv value disabled for safety. Use --stdin (preferred) or add --allow-argv explicitly.');
    }
    value = valueArg;
  }

  if (value === undefined) die('set requires value: use --stdin or --allow-argv <VALUE>');
  value = normalizeValue(value);

  return withLock(opts.file, opts.lockTimeoutMs, () => {
    const lines = readLines(opts.file);
    const result = applySet(lines, key, value, opts.dedupe, !!opts.ifMissing);

    if (!opts.dryRun) {
      const bak = backupFile(opts.file);
      writeFileAtomic(opts.file, buildText(result.out));
      const pruned = pruneBackups(opts.file, opts.backupKeep, opts.backupTtlDays);
      console.log(`changed=${result.changed}`);
      console.log(`removed=${result.removed}`);
      console.log(`skipped=${result.skipped}`);
      console.log(`backup=${bak}`);
      console.log(`backups_deleted=${pruned.deleted}`);
      console.log(`backups_remaining=${pruned.remaining}`);
      return;
    }

    console.log('dry_run=true');
    console.log(`changed=${result.changed}`);
    console.log(`removed=${result.removed}`);
    console.log(`skipped=${result.skipped}`);
  });
}

function applyUnset(lines, key) {
  const out = [];
  let removed = 0;
  for (const ln of lines) {
    if (extractKey(ln) === key) {
      removed++;
      continue;
    }
    out.push(ln);
  }
  return { out, removed };
}

function cmdUnset(opts, key) {
  validateKey(key);

  return withLock(opts.file, opts.lockTimeoutMs, () => {
    const lines = readLines(opts.file);
    const result = applyUnset(lines, key);

    if (!opts.dryRun) {
      const bak = backupFile(opts.file);
      writeFileAtomic(opts.file, buildText(result.out));
      const pruned = pruneBackups(opts.file, opts.backupKeep, opts.backupTtlDays);
      console.log(`removed=${result.removed}`);
      console.log(`backup=${bak}`);
      console.log(`backups_deleted=${pruned.deleted}`);
      console.log(`backups_remaining=${pruned.remaining}`);
      return;
    }

    console.log('dry_run=true');
    console.log(`removed=${result.removed}`);
  });
}

function cmdDoctor(opts) {
  const exists = fs.existsSync(opts.file);
  const f = lintFindings(opts.file);
  const dir = path.dirname(opts.file);
  const base = path.basename(opts.file);
  const backupCount = fs.existsSync(dir)
    ? fs.readdirSync(dir).filter((n) => n.startsWith(`${base}.bak.`)).length
    : 0;

  console.log(`file=${opts.file}`);
  console.log(`exists=${exists ? 'yes' : 'no'}`);
  console.log(`keys=${f.keyCount}`);
  console.log(`assignments=${f.assignmentCount}`);
  console.log(`invalid_lines=${f.invalidLines.length}`);
  console.log(`duplicate_keys=${f.duplicates.length}`);
  console.log(`backups=${backupCount}`);
  if (f.invalidLines.length) console.log(`invalid_line_numbers=${f.invalidLines.join(',')}`);
  if (f.duplicates.length) console.log(`duplicate_key_names=${f.duplicates.map((x) => x.key).join(',')}`);
}

(function main() {
  const opts = parseArgs(process.argv.slice(2));
  const [cmd, a1, a2] = opts._;

  if (!cmd) {
    die('usage: envsafe.js [--file PATH] [--dry-run] [--stdin] [--allow-argv] [--if-missing] [--dedupe keep-last|keep-first|none] <keys|exists|set|unset|lint|doctor> ...');
  }

  if (cmd === 'keys') return cmdKeys(opts);
  if (cmd === 'exists') return cmdExists(opts, a1);
  if (cmd === 'lint') return cmdLint(opts);
  if (cmd === 'doctor') return cmdDoctor(opts);
  if (cmd === 'set') return cmdSet(opts, a1, a2);
  if (cmd === 'unset') return cmdUnset(opts, a1);

  die(`unknown command: ${cmd}`);
})();
