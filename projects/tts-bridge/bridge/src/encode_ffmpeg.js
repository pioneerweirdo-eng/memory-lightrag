import { spawn } from 'node:child_process';
import { resolve as resolvePath } from 'node:path';
import fs from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

function collectStream(stream) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    stream.on('data', (c) => chunks.push(Buffer.from(c)));
    stream.on('end', () => resolve(Buffer.concat(chunks)));
    stream.on('error', reject);
  });
}

function tryResolveFfmpegStatic() {
  try {
    // ffmpeg-static exports a string path to the bundled binary.
    const p = require('ffmpeg-static');
    if (typeof p === 'string' && p.length > 0) return p;
  } catch {}
  return null;
}

function isExecutable(path) {
  try {
    fs.accessSync(path, fs.constants.X_OK);
    return true;
  } catch {
    return false;
  }
}

function getDefaultFfmpegPath() {
  // 1) Prefer a bridge-local bundled binary when present.
  const bundled = resolvePath(process.cwd(), 'bin', 'ffmpeg');
  if (fs.existsSync(bundled) && isExecutable(bundled)) return bundled;

  // 2) Explicit override.
  if (process.env.FFMPEG_PATH) return process.env.FFMPEG_PATH;

  // 3) NPM-bundled binary.
  const staticPath = tryResolveFfmpegStatic();
  if (staticPath) return staticPath;

  // 4) System PATH.
  return 'ffmpeg';
}

export async function ffmpegEncodeFromPcm16le(pcm, {
  format, // 'opus' | 'mp3'
  sampleRate = 24000,
  channels = 1,
  timeoutMs = 15_000,
  ffmpegPath
} = {}) {
  if (!Buffer.isBuffer(pcm)) pcm = Buffer.from(pcm);
  const bin = ffmpegPath || getDefaultFfmpegPath();

  let args;
  if (format === 'opus') {
    const bitrate = process.env.OPUS_BITRATE || '24k';
    args = [
      '-hide_banner',
      '-loglevel', 'error',
      '-f', 's16le',
      '-ar', String(sampleRate),
      '-ac', String(channels),
      '-i', 'pipe:0',
      '-c:a', 'libopus',
      '-b:a', bitrate,
      '-vbr', 'on',
      '-application', 'voip',
      '-f', 'ogg',
      'pipe:1'
    ];
  } else if (format === 'mp3') {
    const bitrate = process.env.MP3_BITRATE || '48k';
    args = [
      '-hide_banner',
      '-loglevel', 'error',
      '-f', 's16le',
      '-ar', String(sampleRate),
      '-ac', String(channels),
      '-i', 'pipe:0',
      '-c:a', 'libmp3lame',
      '-b:a', bitrate,
      '-f', 'mp3',
      'pipe:1'
    ];
  } else {
    throw new Error(`Unsupported encode format: ${format}`);
  }

  const child = spawn(bin, args, {
    stdio: ['pipe', 'pipe', 'pipe']
  });

  const stderrP = collectStream(child.stderr);
  const stdoutP = collectStream(child.stdout);

  const timer = setTimeout(() => {
    child.kill('SIGKILL');
  }, timeoutMs);

  child.stdin.end(pcm);

  const [stdout, stderr, code] = await Promise.all([
    stdoutP,
    stderrP,
    new Promise((resolve) => child.on('close', (c) => resolve(c)))
  ]).finally(() => clearTimeout(timer));

  if (code !== 0) {
    const msg = stderr.toString('utf8').slice(0, 2000) || `ffmpeg failed (code=${code})`;
    throw new Error(msg);
  }

  if (!stdout || stdout.length === 0) {
    throw new Error(`ffmpeg produced empty output for format=${format}`);
  }

  return stdout;
}

export function probeFfmpeg(ffmpegPath) {
  const bin = ffmpegPath || getDefaultFfmpegPath();
  const bundled = fs.existsSync(resolvePath(process.cwd(), 'bin', 'ffmpeg'));
  const viaNpm = tryResolveFfmpegStatic();
  return {
    ok: true,
    path: bin,
    bundled,
    viaNpm: viaNpm ? true : false
  };
}
