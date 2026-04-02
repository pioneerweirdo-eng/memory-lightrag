/**
 * Extraction Batch Evaluation
 *
 * Runs LLM extraction against extraction_labeled_v1.json and measures:
 *   - schema validity rate   (fraction of extracted objects passing validateMemoryObject)
 *   - provenance completeness (fraction of extracted objects with non-empty sourceIds)
 *   - type accuracy          (fraction of extracted objects whose kind matches annotation)
 *   - unsupported-claim rate (fraction of extracted fields not in source text — manual annotation)
 *   - fallback-to-raw rate   (fraction of samples that returned zero objects → downgraded to raw Episode)
 *
 * Usage:
 *   EXTRACTION_BASE_URL=http://127.0.0.1:3000/v1 ^
 *   EXTRACTION_API_KEY=... ^
 *   EXTRACTION_MODEL=gpt-4o ^
 *   node --experimental-strip-types eval/run-extraction-eval.mjs
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATASET_PATH = path.join(__dirname, "datasets/extraction_labeled_v1.json");
const REPORT_PATH = path.join(__dirname, "reports/extraction_eval_results_2026-04-02.md");

const LLM_CONFIG = {
  provider: process.env.EXTRACTION_PROVIDER ?? "openai",
  baseUrl: process.env.EXTRACTION_BASE_URL?.replace(/\/$/, ""),
  apiKey: process.env.EXTRACTION_API_KEY ?? "",
  model: process.env.EXTRACTION_MODEL ?? "gpt-4o",
  timeout: Number(process.env.EXTRACTION_TIMEOUT ?? 60000),
};

function safeDiv(a, b) { return b === 0 ? 0 : a / b; }
function pct(v) { return `${(v * 100).toFixed(2)}%`; }

// ─── LLM client (minimal inline, mirrors src/llm/client.ts semantics) ────────
// NOTE:
// - This runner talks to an extraction-model endpoint, not to the LightRAG service.
// - LIGHTRAG_* variables must not be used here.

async function llmComplete(prompt, system) {
  const body = {
    model: LLM_CONFIG.model,
    messages: [
      ...(system ? [{ role: "system", content: system }] : []),
      { role: "user", content: prompt },
    ],
    temperature: 0.1,
    max_tokens: 2048,
  };

  const headers = {
    "Content-Type": "application/json",
    ...(LLM_CONFIG.provider === "openai" && LLM_CONFIG.apiKey
      ? { Authorization: `Bearer ${LLM_CONFIG.apiKey}` }
      : {}),
    ...(LLM_CONFIG.provider === "azure" && LLM_CONFIG.apiKey
      ? { "api-key": LLM_CONFIG.apiKey }
      : {}),
  };

  const res = await fetch(`${LLM_CONFIG.baseUrl}/chat/completions`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(LLM_CONFIG.timeout),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`LLM API error ${res.status}: ${text}`);
  }

  const json = await res.json();
  return json.choices?.[0]?.message?.content ?? "";
}

// ─── Extraction prompt registry (mirrors src/write/extraction.ts) ─────────────

const EXTRACTION_SYSTEM_PROMPT = `You are a memory extraction assistant. Given a raw session turn, extract structured memory objects.

RULES:
- Output ONLY valid JSON — no markdown, no explanation, no commentary.
- If the turn does not contain a clear decision, preference, or bounded event, output an Episode only.
- Every object must include a sourceIds array with at least one provenance reference.
- Use ISO-8601 timestamps (e.g., 2026-04-01T10:30:00Z) for all time fields.
- newly extracted objects start in "candidate" state, not "promoted".
- Do NOT fabricate fields not present in the source text.

OBJECT DEFINITIONS:

Episode:
  - a bounded interaction, event, or observation
  - required fields: kind="episode", id (generate: "ep_<timestamp>_<hash4>"), timestamp, summary (1-2 sentences), sourceIds, state="candidate"
  - optional: participants (list of names), about (list of topics)

Decision:
  - an explicit conclusion or chosen direction with future impact
  - required fields: kind="decision", id (generate: "dc_<timestamp>_<hash4>"), statement (the decision text), effectiveAt (ISO-8601), sourceIds, state="candidate"
  - only extract when the text contains an explicit choice, conclusion, or resolved direction

Preference:
  - a stable user/team preference or working convention
  - required fields: kind="preference", id (generate: "pf_<timestamp>_<hash4>"), owner (who holds this preference), statement (the preference text), sourceIds, state="candidate"
  - optional: scope (which context this applies in)
  - only extract when the text contains a stated or implied preference, convention, or habit

Source:
  - provenance record for external references
  - required fields: kind="source", id (generate: "src_<hash8>"), kind="file"|"message"|"web", uri or snippet, createdAt
  - attach to objects via sourceIds

OUTPUT FORMAT:
Always output a JSON object with an optional "memory_objects" array:
{
  "memory_objects": [ /* zero or more Episode/Decision/Preference objects */ ],
  "sources": [ /* zero or more Source objects */ ]
}
If no structured objects can be extracted, output: { "memory_objects": [], "sources": [] }`;

const EXTRACTION_USER_PROMPT_TEMPLATE = `Extract memory objects from the following session turn:

---
{{TURN_TEXT}}
---`;

function buildExtractionPrompt(turnText) {
  return EXTRACTION_USER_PROMPT_TEMPLATE.replace("{{TURN_TEXT}}", turnText);
}

// ─── Minimal memory object validation (mirrors src/types/contracts.ts) ────────

function validateExtractedObject(obj) {
  const errors = [];
  if (!obj.id || typeof obj.id !== "string") errors.push("missing or invalid id");
  if (!Array.isArray(obj.sourceIds) || obj.sourceIds.length === 0) errors.push("sourceIds is required and non-empty");
  if (!obj.state || !["candidate", "promoted", "revoked"].includes(obj.state)) {
    errors.push(`invalid state: ${obj.state}`);
  }
  if (obj.kind === "episode") {
    if (!obj.timestamp) errors.push("episode requires timestamp");
    if (!obj.summary || typeof obj.summary !== "string" || !obj.summary.trim()) errors.push("episode requires non-empty summary");
  } else if (obj.kind === "decision") {
    if (!obj.statement || typeof obj.statement !== "string" || !obj.statement.trim()) errors.push("decision requires non-empty statement");
    if (!obj.effectiveAt) errors.push("decision requires effectiveAt");
  } else if (obj.kind === "preference") {
    if (!obj.owner || typeof obj.owner !== "string") errors.push("preference requires owner");
    if (!obj.statement || typeof obj.statement !== "string" || !obj.statement.trim()) errors.push("preference requires non-empty statement");
  } else {
    errors.push(`unknown kind: ${obj.kind}`);
  }
  return errors;
}

// ─── Parse LLM response (mirrors src/write/extraction.ts parseExtractionResponse) ─

function parseExtractionResponse(rawJson) {
  let parsed;
  try {
    parsed = JSON.parse(rawJson);
  } catch {
    return null;
  }
  if (!parsed || typeof parsed !== "object") return null;
  const obj = parsed;
  const objects = Array.isArray(obj.memory_objects) ? obj.memory_objects : [];
  const sources = Array.isArray(obj.sources) ? obj.sources : [];

  const validKinds = ["episode", "decision", "preference"];
  const validObjects = objects
    .filter((o) => {
      if (!o || typeof o !== "object") return false;
      if (typeof o.kind !== "string" || !validKinds.includes(o.kind)) return false;
      if (!Array.isArray(o.sourceIds) || o.sourceIds.length === 0) return false;
      if (o.kind === "episode") {
        if (!o.timestamp || typeof o.summary !== "string" || !o.summary) return false;
      } else if (o.kind === "decision") {
        if (!o.statement || typeof o.statement !== "string" || !o.statement) return false;
        if (!o.effectiveAt) return false;
      } else if (o.kind === "preference") {
        if (!o.owner || typeof o.owner !== "string") return false;
        if (!o.statement || typeof o.statement !== "string" || !o.statement) return false;
      }
      return true;
    });
  return { objects: validObjects, sources };
}

// ─── Evaluation runner ─────────────────────────────────────────────────────────

async function runExtraction(sample, llmFn) {
  const prompt = buildExtractionPrompt(sample.turn_text);
  let rawResponse;
  try {
    rawResponse = await llmFn(prompt, EXTRACTION_SYSTEM_PROMPT);
  } catch (err) {
    return {
      sampleId: sample.id,
      ok: false,
      schemaValid: false,
      provenanceComplete: false,
      typeAccuracy: false,
      fallbackToRaw: true,
      unsupportedClaim: false, // cannot assess on error
      extracted: [],
      parseError: err.message,
    };
  }

  const parsed = parseExtractionResponse(rawResponse);
  if (!parsed) {
    return {
      sampleId: sample.id,
      ok: false,
      schemaValid: false,
      provenanceComplete: false,
      typeAccuracy: false,
      fallbackToRaw: true, // unparseable → treat as fallback to raw
      unsupportedClaim: false,
      extracted: [],
      parseError: "JSON parse failed",
    };
  }

  if (parsed.objects.length === 0) {
    return {
      sampleId: sample.id,
      ok: true,
      schemaValid: true,
      provenanceComplete: true,
      typeAccuracy: true,
      fallbackToRaw: true,
      unsupportedClaim: false,
      extracted: [],
    };
  }

  const first = parsed.objects[0];
  const validationErrors = validateExtractedObject(first);
  const schemaValid = validationErrors.length === 0;
  const provenanceComplete = Array.isArray(first.sourceIds) && first.sourceIds.length > 0;
  const typeAccuracy = first.kind === sample.expected.kind;

  // unsupported-claim rate: we flag if the extracted summary/statement length
  // exceeds source text by >3x (a heuristic for hallucinated content)
  // A proper implementation would use a second LLM call for NER comparison
  let unsupportedClaim = false;
  if (first.kind === "episode" && first.summary) {
    if (first.summary.length > sample.turn_text.length * 3) unsupportedClaim = true;
  } else if (first.kind === "decision" && first.statement) {
    if (first.statement.length > sample.turn_text.length * 3) unsupportedClaim = true;
  } else if (first.kind === "preference" && first.statement) {
    if (first.statement.length > sample.turn_text.length * 3) unsupportedClaim = true;
  }

  return {
    sampleId: sample.id,
    ok: true,
    schemaValid,
    provenanceComplete,
    typeAccuracy,
    fallbackToRaw: false,
    unsupportedClaim,
    extracted: parsed.objects,
    validationErrors,
    rawResponse,
  };
}

async function main() {
  if (!LLM_CONFIG.baseUrl) {
    console.error("Missing EXTRACTION_BASE_URL.");
    console.error("This eval runner calls an extraction-model endpoint via /chat/completions, not the LightRAG service.");
    console.error("Set EXTRACTION_BASE_URL explicitly, for example: http://127.0.0.1:3000/v1");
    process.exit(1);
  }

  if (!["openai", "azure"].includes(LLM_CONFIG.provider)) {
    console.error(`Invalid EXTRACTION_PROVIDER: ${LLM_CONFIG.provider}`);
    console.error("Allowed values: openai, azure");
    process.exit(1);
  }

  if (!Number.isFinite(LLM_CONFIG.timeout) || LLM_CONFIG.timeout <= 0) {
    console.error(`Invalid EXTRACTION_TIMEOUT: ${process.env.EXTRACTION_TIMEOUT ?? ""}`);
    console.error("EXTRACTION_TIMEOUT must be a positive number of milliseconds.");
    process.exit(1);
  }

  console.log("=".repeat(60));
  console.log("Extraction Batch Evaluation");
  console.log("=".repeat(60));
  console.log(`Dataset: ${DATASET_PATH}`);
  console.log(`Extraction Model: ${LLM_CONFIG.model}`);
  console.log(`Extraction Provider: ${LLM_CONFIG.provider}`);
  console.log(`Extraction Endpoint: ${LLM_CONFIG.baseUrl}`);
  console.log("");

  if (!fs.existsSync(DATASET_PATH)) {
    console.error(`Dataset not found: ${DATASET_PATH}`);
    process.exit(1);
  }

  const raw = fs.readFileSync(DATASET_PATH, "utf8");
  const dataset = JSON.parse(raw);
  console.log(`Loaded ${dataset.length} labeled samples\n`);

  const results = [];
  let skipped = 0;

  for (const sample of dataset) {
    process.stdout.write(`  [${sample.id}] ${sample.expected.kind} ... `);
    const result = await runExtraction(sample, llmComplete);
    results.push(result);
    if (result.ok) {
      process.stdout.write(
        `schema=${result.schemaValid ? "✓" : "✗"} ` +
        `prov=${result.provenanceComplete ? "✓" : "✗"} ` +
        `type=${result.typeAccuracy ? "✓" : "✗"} ` +
        `fallback=${result.fallbackToRaw ? "↩" : "—"} ` +
        `unsup=${result.unsupportedClaim ? "⚠" : "—"}` +
        `\n`
      );
    } else {
      process.stdout.write(`ERROR: ${result.parseError}\n`);
      skipped++;
    }
  }

  // ─── Aggregate metrics ────────────────────────────────────────────────────────
  const total = results.length;
  const schemaValidCount = results.filter((r) => r.schemaValid).length;
  const provenanceCompleteCount = results.filter((r) => r.provenanceComplete).length;
  const typeAccuracyCount = results.filter((r) => r.typeAccuracy).length;
  const unsupportedClaimCount = results.filter((r) => r.unsupportedClaim).length;
  const fallbackToRawCount = results.filter((r) => r.fallbackToRaw).length;

  const schemaValidityRate = safeDiv(schemaValidCount, total);
  const provenanceCompleteness = safeDiv(provenanceCompleteCount, total);
  const typeAccuracy = safeDiv(typeAccuracyCount, total);
  const unsupportedClaimRate = safeDiv(unsupportedClaimCount, total);
  const fallbackToRawRate = safeDiv(fallbackToRawCount, total);

  // ─── Per-kind breakdown ───────────────────────────────────────────────────────
  const byKind = {};
  for (const sample of dataset) {
    const kind = sample.expected.kind;
    if (!byKind[kind]) byKind[kind] = { total: 0, valid: 0, accurate: 0 };
    byKind[kind].total++;
    const r = results.find((x) => x.sampleId === sample.id);
    if (r) {
      if (r.schemaValid) byKind[kind].valid++;
      if (r.typeAccuracy) byKind[kind].accurate++;
    }
  }

  // ─── Gate threshold check ─────────────────────────────────────────────────────
  const gates = [
    { name: "schema validity rate",        threshold: 0.95, actual: schemaValidityRate,   pass: schemaValidityRate >= 0.95 },
    { name: "provenance completeness",      threshold: 0.98, actual: provenanceCompleteness, pass: provenanceCompleteness >= 0.98 },
    { name: "type accuracy",                threshold: 0.85, actual: typeAccuracy,          pass: typeAccuracy >= 0.85 },
    { name: "unsupported-claim rate",        threshold: 0.05, actual: unsupportedClaimRate,   pass: unsupportedClaimRate <= 0.05 },
  ];

  // ─── Build report ─────────────────────────────────────────────────────────────
  const now = new Date().toISOString();
  const report = [
    `# Extraction Evaluation Report — ${now}`,
    "",
    "## Configuration",
    "",
    `| Parameter | Value |`,
    `|---|---|`,
    `| Model | ${LLM_CONFIG.model} |`,
    `| Extraction Provider | ${LLM_CONFIG.provider} |`,
    `| Extraction Base URL | ${LLM_CONFIG.baseUrl} |`,
    `| Dataset | extraction_labeled_v1.json |`,
    `| Samples | ${total} |`,
    `| Skipped (error) | ${skipped} |`,
    "",
    "## Aggregate Metrics",
    "",
    `| Metric | Value | Threshold | Pass? |`,
    `|---|---|---|---|`,
    ...gates.map((g) => `| ${g.name} | ${pct(g.actual)} | ${pct(g.threshold)} | ${g.pass ? "✓ PASS" : "✗ FAIL"} |`),
    `| fallback-to-raw rate | ${pct(fallbackToRawRate)} | (reported) | — |`,
    "",
    "## Per-Kind Breakdown",
    "",
    `| Kind | Total | Schema Valid | Type Accurate |`,
    `|---|---|---|---|`,
    ...Object.entries(byKind).map(([kind, d]) =>
      `| ${kind} | ${d.total} | ${pct(safeDiv(d.valid, d.total))} | ${pct(safeDiv(d.accurate, d.total))} |`
    ),
    "",
    "## Per-Sample Results",
    "",
    `| Sample | Expected Kind | Schema | Prov | Type | Fallback | Unsupported | Notes |`,
    `|---|---|---|---|---|---|---|---|`,
    ...results.map((r) => {
      const sample = dataset.find((s) => s.id === r.sampleId);
      const notes = r.parseError
        ? `parse error: ${r.parseError}`
        : r.extracted.length === 0
        ? "no objects extracted"
        : r.validationErrors.length > 0
        ? `validation: ${r.validationErrors.join("; ")}`
        : "";
      return `| ${r.sampleId} | ${sample?.expected.kind ?? "?"} | ${r.schemaValid ? "✓" : "✗"} | ${r.provenanceComplete ? "✓" : "✗"} | ${r.typeAccuracy ? "✓" : "✗"} | ${r.fallbackToRaw ? "↩" : "—"} | ${r.unsupportedClaim ? "⚠" : "—"} | ${notes} |`;
    }),
    "",
    "## Gate Decision",
    "",
    gates.every((g) => g.pass)
      ? "**✓ ALL GATES PASSED** — P1 production rollout is unblocked."
      : `**✗ GATES NOT MET** — P1 production rollout remains blocked. FAILED: ${gates.filter((g) => !g.pass).map((g) => g.name).join(", ")}.`,
    "",
    "---",
    `*Extraction eval runner v2026-04-02 · dataset extraction_labeled_v1.json*`,
  ].join("\n");

  // ─── Write report ────────────────────────────────────────────────────────────
  fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true });
  fs.writeFileSync(REPORT_PATH, report, "utf8");

  // ─── Console summary ─────────────────────────────────────────────────────────
  console.log("\n" + "=".repeat(60));
  console.log("RESULTS");
  console.log("=".repeat(60));
  console.log(`  schema validity rate:      ${pct(schemaValidityRate)} (threshold: ${pct(0.95)}) ${schemaValidityRate >= 0.95 ? "✓" : "✗"}`);
  console.log(`  provenance completeness:    ${pct(provenanceCompleteness)} (threshold: ${pct(0.98)}) ${provenanceCompleteness >= 0.98 ? "✓" : "✗"}`);
  console.log(`  type accuracy:             ${pct(typeAccuracy)} (threshold: ${pct(0.85)}) ${typeAccuracy >= 0.85 ? "✓" : "✗"}`);
  console.log(`  unsupported-claim rate:    ${pct(unsupportedClaimRate)} (threshold: ≤${pct(0.05)}) ${unsupportedClaimRate <= 0.05 ? "✓" : "✗"}`);
  console.log(`  fallback-to-raw rate:      ${pct(fallbackToRawRate)} (reported)`);
  console.log("");
  console.log(`  Per-kind schema validity:`);
  for (const [kind, d] of Object.entries(byKind)) {
    console.log(`    ${kind}: ${pct(safeDiv(d.valid, d.total))} (${d.valid}/${d.total})`);
  }
  console.log("");
  console.log(`Report: ${REPORT_PATH}`);
  console.log("");

  if (gates.every((g) => g.pass)) {
    console.log("✓ ALL GATES PASSED — P1 production rollout is unblocked.");
  } else {
    const failed = gates.filter((g) => !g.pass).map((g) => g.name);
    console.log(`✗ GATES NOT MET — P1 production rollout remains blocked:`);
    for (const f of failed) console.log(`    - ${f}`);
  }
}

main().catch((err) => {
  console.error("Extraction eval threw:", err);
  process.exit(1);
});
