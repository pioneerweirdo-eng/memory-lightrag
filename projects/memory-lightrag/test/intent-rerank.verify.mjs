import assert from "node:assert/strict";

import { detectQueryIntent } from "../src/policy/query-intent.ts";
import { getRerankWeights } from "../src/policy/rerank-policy.ts";

const classificationCases = [
  { query: "why did the deployment fail", expected: "WHY" },
  { query: "为什么昨天接口变慢", expected: "WHY" },
  { query: "when was this task finished", expected: "WHEN" },
  { query: "这个问题是什么时候出现的", expected: "WHEN" },
  { query: "who owns this project", expected: "ENTITY" },
  { query: "哪个团队负责这个文档", expected: "ENTITY" },
  { query: "summarize the latest update", expected: "GENERAL" },
  { query: "", expected: "GENERAL" },
];

const boundaryCases = [
  { query: "what changed yesterday", expected: "WHEN" },
  { query: "what changed recently", expected: "WHEN" },
  { query: "what is the reason", expected: "WHY" },
  { query: "which team owns auth service", expected: "ENTITY" },
  { query: "what service handles billing", expected: "ENTITY" },
  { query: "what is this", expected: "GENERAL" },
  { query: "什么是原因", expected: "WHY" },
  { query: "昨天改了什么", expected: "WHEN" },
  { query: "这个项目叫什么名字", expected: "ENTITY" },
  { query: "这是什么", expected: "GENERAL" },
  { query: "哪个导致这次故障", expected: "WHY" },
  { query: "最近有哪些变更", expected: "WHEN" },
  { query: "which is better for now", expected: "GENERAL" },
  { query: "what should we do next", expected: "GENERAL" },
  { query: "什么情况", expected: "GENERAL" },
  { query: "哪个更好", expected: "GENERAL" },
  { query: "which project owns this module", expected: "ENTITY" },
  { query: "why is this slower today", expected: "WHY" },
  // Priority compatibility guard: WHEN cues still beat ENTITY cues.
  { query: "近期谁负责这个服务", expected: "WHEN" },
];

// Threshold-like scored routing boundaries represented by deterministic rules today.
// These guard precision/recall edges where scored routing will later attach explicit minScore/minMargin knobs.
const scoredRoutingBoundaryCases = [
  // WHY precedence should win over temporal/entity hints.
  { query: "why did this break yesterday", expected: "WHY" },
  { query: "为什么这个服务今天失败", expected: "WHY" },

  // WHEN requires strong temporal markers or (time/date + event anchor).
  { query: "what time did deployment start", expected: "WHEN" },
  { query: "which date was this issue released", expected: "WHEN" },
  { query: "what is the time", expected: "GENERAL" },
  { query: "what is the timeline", expected: "GENERAL" },

  // ENTITY should require explicit entity nouns/hints, not weak open-ended prompts.
  { query: "what is this service", expected: "ENTITY" },
  { query: "which project is responsible for billing", expected: "ENTITY" },

  // GENERAL protection: weak ambiguous prompts remain GENERAL.
  { query: "which one is better", expected: "GENERAL" },
  { query: "what is that", expected: "GENERAL" },
  { query: "这是什么？", expected: "GENERAL" },
  { query: "哪个更好？", expected: "GENERAL" },

  // Compatibility guard: temporal cues still outrank entity cues in mixed prompts.
  { query: "which team changed this recently", expected: "WHEN" },
  { query: "最近哪个团队改了这个服务", expected: "WHEN" },
];

for (const { query, expected } of [
  ...classificationCases,
  ...boundaryCases,
  ...scoredRoutingBoundaryCases,
]) {
  const actual = detectQueryIntent(query);
  assert.equal(
    actual,
    expected,
    `detectQueryIntent(${JSON.stringify(query)}) expected ${expected}, got ${actual}`,
  );
}

const intents = ["WHY", "WHEN", "ENTITY", "GENERAL"];

function assertFiniteWeights(intent, weights) {
  for (const [key, value] of Object.entries(weights)) {
    assert.equal(typeof value, "number", `${intent}.${key} must be a number`);
    assert.ok(Number.isFinite(value), `${intent}.${key} must be finite`);
  }

  const total = Object.values(weights).reduce((sum, value) => sum + value, 0);
  assert.ok(Math.abs(total - 1) < 1e-9, `${intent} weights should sum to 1, got ${total}`);
}

for (const intent of intents) {
  const weights = getRerankWeights(intent);
  assertFiniteWeights(intent, weights);
}

const why = getRerankWeights("WHY");
assert.ok(why.causal > why.temporal, "WHY should emphasize causal over temporal");
assert.ok(why.causal > why.entity, "WHY should emphasize causal over entity");

const when = getRerankWeights("WHEN");
assert.ok(when.temporal > when.causal, "WHEN should emphasize temporal over causal");
assert.ok(when.temporal > when.entity, "WHEN should emphasize temporal over entity");

const entity = getRerankWeights("ENTITY");
assert.ok(entity.entity > entity.causal, "ENTITY should emphasize entity over causal");
assert.ok(entity.entity > entity.temporal, "ENTITY should emphasize entity over temporal");

const general = getRerankWeights("GENERAL");
assert.equal(general.causal, general.temporal, "GENERAL should keep balanced weights");
assert.equal(general.temporal, general.entity, "GENERAL should keep balanced weights");
assert.equal(general.entity, general.lexical, "GENERAL should keep balanced weights");
assert.equal(general.lexical, general.semantic, "GENERAL should keep balanced weights");

console.log("intent-rerank.verify: OK");
console.log(`- classification cases: ${classificationCases.length}`);
console.log(`- boundary cases: ${boundaryCases.length}`);
console.log(`- scored-routing boundary cases: ${scoredRoutingBoundaryCases.length}`);
console.log(`- rerank intents checked: ${intents.length}`);
console.log("- invariants: finite weights + sum-to-1 + GENERAL weak-query protection");
