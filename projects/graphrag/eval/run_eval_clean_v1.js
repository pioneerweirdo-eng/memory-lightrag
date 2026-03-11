#!/usr/bin/env node

const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function run(cmd, args) {
  const r = spawnSync(cmd, args, { encoding: 'utf8', maxBuffer: 50 * 1024 * 1024 });
  if (r.status !== 0) {
    throw new Error(`Command failed (${cmd} ${args.join(' ')}):\n${r.stderr || r.stdout}`);
  }
  return r.stdout;
}

function uniq(arr) {
  return [...new Set(arr)];
}

function scoreOutput(out) {
  // lightweight proxies (no gold labels):
  // - doc diversity (lower is often better for narrow questions)
  // - expanded ratio
  // - total context chars (proxy cost)
  const chunks = out.chunks || [];
  const docs = chunks.map(c => c.path);
  const uniqDocs = uniq(docs);
  const expanded = chunks.filter(c => String(c.why || '').startsWith('expanded'));
  const ctxLen = (out.answerContext || '').length;
  return {
    chunks: chunks.length,
    uniqDocs: uniqDocs.length,
    expanded: expanded.length,
    ctxLen,
  };
}

function main() {
  const root = path.resolve(__dirname, '..', '..', '..');
  const sidecar = path.join(root, 'projects/graphrag/sidecar/openclaw-graphrag.js');
  const questionsPath = path.join(root, 'projects/graphrag/eval/questions.clean.v1.json');
  const qs = JSON.parse(fs.readFileSync(questionsPath, 'utf8'));

  const workspace = root;
  const sandboxDir = 'graphrag_sandbox';
  const index = 'clean';

  // Ensure index exists
  run('node', [sidecar, 'build', '--workspace', workspace, '--docsDir', 'projects/graphrag/docs/papers_clean', '--sandboxDir', sandboxDir, '--index', index]);

  const results = [];

  for (const item of qs) {
    const q = item.q;

    const baseRaw = run('node', [sidecar, 'query', '--workspace', workspace, '--sandboxDir', sandboxDir, '--index', index,
      '--question', q, '--topK', '8', '--graph', 'false']);
    const base = JSON.parse(baseRaw);

    const graphRaw = run('node', [sidecar, 'query', '--workspace', workspace, '--sandboxDir', sandboxDir, '--index', index,
      '--question', q, '--topK', '8', '--graph', 'true', '--seedK', '5', '--expandK', '6', '--minEntityHits', '2', '--maxExpandChars', '2000']);
    const graph = JSON.parse(graphRaw);

    results.push({
      id: item.id,
      q,
      baseline: scoreOutput(base),
      graph: scoreOutput(graph),
      sample: {
        baselineTop: (base.chunks || []).slice(0, 3),
        graphTop: (graph.chunks || []).slice(0, 3),
        graphExpandedWhy: (graph.chunks || []).filter(c => String(c.why||'').startsWith('expanded')).slice(0, 3).map(c => c.why),
      }
    });
  }

  const out = {
    schemaVersion: 1,
    ranAt: new Date().toISOString(),
    index,
    params: { topK: 8, seedK: 5, expandK: 6, minEntityHits: 2, maxExpandChars: 2000 },
    results,
  };

  const outPath = path.join(root, 'projects/graphrag/artifacts/eval-clean-v1.json');
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(out, null, 2));

  // Print summary
  const agg = { n: results.length, baseCtx: 0, graphCtx: 0, baseDocs: 0, graphDocs: 0, baseExp: 0, graphExp: 0 };
  for (const r of results) {
    agg.baseCtx += r.baseline.ctxLen;
    agg.graphCtx += r.graph.ctxLen;
    agg.baseDocs += r.baseline.uniqDocs;
    agg.graphDocs += r.graph.uniqDocs;
    agg.baseExp += r.baseline.expanded;
    agg.graphExp += r.graph.expanded;
  }
  const avg = (x) => Math.round((x / agg.n) * 10) / 10;

  console.log(JSON.stringify({
    ok: true,
    outPath,
    avg: {
      baseline_ctxLen: avg(agg.baseCtx),
      graph_ctxLen: avg(agg.graphCtx),
      baseline_uniqDocs: avg(agg.baseDocs),
      graph_uniqDocs: avg(agg.graphDocs),
      baseline_expanded: avg(agg.baseExp),
      graph_expanded: avg(agg.graphExp),
    }
  }, null, 2));
}

main();
