/**
 * P2 Recall Evaluation
 *
 * Compares flat-snippet recall vs graph-native (evidenceAssembly) recall
 * on a labeled recall dataset.
 *
 * Metrics:
 *   - keyword_hit_rate: fraction of expected keywords present in result
 *   - kind_match_rate: fraction where returned object kind matches annotation
 *   - graph_entity_expansion: fraction where graph-native found related entities
 *   - empty_rate: fraction of queries returning zero results
 *   - flat_vs_graph comparison per query
 *
 * Usage:
 *   LIGHTRAG_BASE_URL=http://127.0.0.1:9621 \
 *   LIGHTRAG_API_KEY=... \
 *   node --experimental-strip-types eval/run-recall-eval.mjs
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { LightragAdapter } from "../src/adapter/lightrag.ts";
import { assembleEvidenceChain, assembleAnswerFromChain, isRevokedChunk } from "../src/recall/retrieval.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATASET_PATH = path.join(__dirname, "datasets/recall_labeled_v1.json");
const REPORT_PATH = path.join(__dirname, "reports/recall_eval_results_2026-04-02.md");

const LIGHTRAG_CONFIG = {
  baseUrl: process.env.LIGHTRAG_BASE_URL ?? "http://127.0.0.1:9621",
  // LightRAG has auth_mode=disabled — do NOT send API key to query endpoint
  apiKey: "",
  timeout: 30000,
};

function safeDiv(a, b) { return b === 0 ? 0 : a / b; }
function pct(v) { return `${(v * 100).toFixed(2)}%`; }

// ─── Keyword scoring ─────────────────────────────────────────────────────────

/**
 * Check how many expected keywords appear in the result text.
 * Case-insensitive substring match.
 */
function scoreKeywordHit(resultText, keywords) {
  if (keywords.length === 0) return 1;
  const lower = resultText.toLowerCase();
  const hits = keywords.filter((kw) => lower.includes(kw.toLowerCase()));
  return safeDiv(hits.length, keywords.length);
}

// ─── Recall runner ────────────────────────────────────────────────────────────

async function runRecallQuery(adapter, query, workspace, domain, mode) {
  const lr = await adapter.search(query, workspace);
  if (!lr.success || !lr.results || lr.results.length === 0) {
    return { ok: false, resultText: "", mode, entitiesFound: 0, relationsFound: 0 };
  }

  // LightRAG returns raw idempotency key hash as file_path in practice,
  // not the domain-prefixed file_source. Use lenient filtering that matches
  // actual LightRAG behavior: accept all non-revoked chunks.
  // Domain access control is enforced at the API layer in production.
  const filtered = lr.results.filter((r) => !isRevokedChunk(r));

  if (mode === "flat-snippet") {
    const resultText = filtered
      .slice(0, 8)
      .map((r) => `${r.path ?? ""}\n${r.content ?? ""}`)
      .join("\n---\n");
    return { ok: true, resultText, mode, entitiesFound: 0, relationsFound: 0 };
  }

  // graph-native
  const chain = assembleEvidenceChain(query, lr, {
    domain,
    filteredChunks: filtered,
  });
  const resultText = assembleAnswerFromChain(chain);
  return {
    ok: true,
    resultText,
    mode,
    entitiesFound: chain.anchors.reduce((s, a) => s + a.relatedEntities.length, 0),
    relationsFound: chain.anchors.reduce((s, a) => s + a.relatedRelations.length, 0),
    anchorCount: chain.anchors.length,
  };
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  console.log("=".repeat(60));
  console.log("P2 Recall Evaluation");
  console.log("=".repeat(60));
  console.log(`Dataset: ${DATASET_PATH}`);
  console.log(`LightRAG: ${LIGHTRAG_CONFIG.baseUrl}`);
  console.log("");

  if (!fs.existsSync(DATASET_PATH)) {
    console.error(`Dataset not found: ${DATASET_PATH}`);
    process.exit(1);
  }

  const raw = fs.readFileSync(DATASET_PATH, "utf8");
  const dataset = JSON.parse(raw);
  console.log(`Loaded ${dataset.length} recall queries\n`);

  const adapter = new LightragAdapter(LIGHTRAG_CONFIG);

  const results = [];
  let skipped = 0;

  for (const item of dataset) {
    process.stdout.write(`  [${item.id}] ${item.query.slice(0, 50)}... `);

    // Run both paths sequentially
    // Note: no workspace header — data was written without workspace namespace restriction
    const flatResult = await runRecallQuery(adapter, item.query, "", item.domain, "flat-snippet");
    const graphResult = await runRecallQuery(adapter, item.query, "", item.domain, "graph-native");

    if (!flatResult.ok && !graphResult.ok) {
      process.stdout.write("EMPTY (both paths)\n");
      skipped++;
      results.push({ itemId: item.id, flat: flatResult, graph: graphResult, skipped: true });
      continue;
    }

    // Score flat-snippet
    const flatKeywordScore = scoreKeywordHit(flatResult.resultText, item.expected_keywords);

    // Score graph-native
    const graphKeywordScore = scoreKeywordHit(graphResult.resultText, item.expected_keywords);

    // Compare
    const graphBetter = graphKeywordScore > flatKeywordScore;
    const flatBetter = flatKeywordScore > graphKeywordScore;
    const sameScore = graphKeywordScore === flatKeywordScore;

    process.stdout.write(
      `kw_flat=${pct(flatKeywordScore)} kw_graph=${pct(graphKeywordScore)} ` +
      `graph_anchors=${graphResult.anchorCount ?? 0} ` +
      `graph_ent=${graphResult.entitiesFound} graph_rel=${graphResult.relationsFound} ` +
      `${graphBetter ? "→GRAPH" : flatBetter ? "→FLAT" : "SAME"}\n`
    );

    results.push({
      itemId: item.id,
      query: item.query,
      expectedKind: item.expected_memory_kind,
      expectedKeywords: item.expected_keywords,
      flat: { ...flatResult, keywordScore: flatKeywordScore },
      graph: { ...graphResult, keywordScore: graphKeywordScore },
      graphBetter,
      flatBetter,
      sameScore,
      skipped: false,
    });
  }

  // ─── Aggregate ───────────────────────────────────────────────────────────
  const total = results.length;
  const nonSkipped = results.filter((r) => !r.skipped);

  const flatKeywordAvg = safeDiv(
    nonSkipped.reduce((s, r) => s + r.flat.keywordScore, 0),
    nonSkipped.length,
  );
  const graphKeywordAvg = safeDiv(
    nonSkipped.reduce((s, r) => s + r.graph.keywordScore, 0),
    nonSkipped.length,
  );

  const graphEntitiesFound = nonSkipped.filter((r) => r.graph.entitiesFound > 0).length;
  const graphRelationsFound = nonSkipped.filter((r) => r.graph.relationsFound > 0).length;
  const graphAnchorsFound = nonSkipped.filter((r) => (r.graph.anchorCount ?? 0) > 0).length;

  const graphBetterCount = nonSkipped.filter((r) => r.graphBetter).length;
  const flatBetterCount = nonSkipped.filter((r) => r.flatBetter).length;
  const sameScoreCount = nonSkipped.filter((r) => r.sameScore).length;

  const emptyCount = results.filter((r) => r.skipped).length;

  // ─── Report ──────────────────────────────────────────────────────────────
  const now = new Date().toISOString();
  const report = [
    `# Recall Evaluation Report — ${now}`,
    "",
    "## Configuration",
    "",
    `| Parameter | Value |`,
    `|---|---|`,
    `| LightRAG | ${LIGHTRAG_CONFIG.baseUrl} |`,
    `| Dataset | recall_labeled_v1.json |`,
    `| Queries | ${total} |`,
    `| Skipped (both empty) | ${skipped} |`,
    "",
    "## Aggregate Metrics",
    "",
    `| Metric | Flat-Snippet | Graph-Native |`,
    `|---|---|---|`,
    `| Avg keyword hit rate | ${pct(flatKeywordAvg)} | ${pct(graphKeywordAvg)} |`,
    "",
    `| Metric | Value |`,
    `|---|---|`,
    `| Graph with entity expansion | ${pct(safeDiv(graphEntitiesFound, total))} (${graphEntitiesFound}/${total}) |`,
    `| Graph with relation expansion | ${pct(safeDiv(graphRelationsFound, total))} (${graphRelationsFound}/${total}) |`,
    `| Graph with anchors | ${pct(safeDiv(graphAnchorsFound, total))} (${graphAnchorsFound}/${total}) |`,
    `| Both paths same score | ${pct(safeDiv(sameScoreCount, total))} (${sameScoreCount}/${total}) |`,
    `| Graph wins (keyword) | ${pct(safeDiv(graphBetterCount, total))} (${graphBetterCount}/${total}) |`,
    `| Flat wins (keyword) | ${pct(safeDiv(flatBetterCount, total))} (${flatBetterCount}/${total}) |`,
    "",
    "## Per-Query Results",
    "",
    `| Query | Expected Kind | Flat KW | Graph KW | Anchors | Ent | Rel | Winner |`,
    `|---|---|---|---|---|---|---|---|`,
    ...results.map((r) => {
      if (r.skipped) return `| ${r.itemId} | — | — | — | — | — | — | SKIPPED |`;
      const flat = pct(r.flat.keywordScore);
      const graph = pct(r.graph.keywordScore);
      const winner = r.graphBetter ? "GRAPH" : r.flatBetter ? "FLAT" : "SAME";
      return `| ${r.itemId} | ${r.expectedKind} | ${flat} | ${graph} | ${r.graph.anchorCount ?? 0} | ${r.graph.entitiesFound} | ${r.graph.relationsFound} | ${winner} |`;
    }),
    "",
    "## Gate Decision",
    "",
    graphKeywordAvg >= flatKeywordAvg
      ? `**✓ Graph-native keyword recall ≥ flat-snippet** — P2 recall path is viable.`
      : `**⚠ Graph-native keyword recall < flat-snippet** — flat-snippet still outperforms on keyword coverage. Investigate entity linking or evidence assembly strategy.`,
    "",
    "---",
    `*Recall eval runner v2026-04-02 · dataset recall_labeled_v1.json*`,
  ].join("\n");

  fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true });
  fs.writeFileSync(REPORT_PATH, report, "utf8");

  // ─── Console summary ───────────────────────────────────────────────────────
  console.log("\n" + "=".repeat(60));
  console.log("RESULTS");
  console.log("=".repeat(60));
  console.log(`  Flat-snippet keyword hit rate: ${pct(flatKeywordAvg)}`);
  console.log(`  Graph-native keyword hit rate:  ${pct(graphKeywordAvg)}`);
  console.log(`  Graph entity expansion:         ${pct(safeDiv(graphEntitiesFound, total))} (${graphEntitiesFound}/${total})`);
  console.log(`  Graph relation expansion:       ${pct(safeDiv(graphRelationsFound, total))} (${graphRelationsFound}/${total})`);
  console.log(`  Graph anchors assembled:        ${pct(safeDiv(graphAnchorsFound, total))} (${graphAnchorsFound}/${total})`);
  console.log(`  Graph wins:                    ${graphBetterCount}/${total}`);
  console.log(`  Flat wins:                     ${flatBetterCount}/${total}`);
  console.log(`  Same:                          ${sameScoreCount}/${total}`);
  console.log(`  Both empty (skipped):          ${skipped}/${total}`);
  console.log(`\nReport: ${REPORT_PATH}`);
  console.log("");

  if (graphKeywordAvg >= flatKeywordAvg) {
    console.log("✓ Graph-native recall viable — keyword coverage meets or exceeds flat-snippet.");
  } else {
    console.log("⚠ Graph-native recall underperforms flat-snippet on keyword coverage.");
  }
}

main().catch((err) => {
  console.error("Recall eval threw:", err);
  process.exit(1);
});
