import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { detectQueryIntent as detectQueryIntentT5 } from "../src/policy/query-intent.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATASET_PATH = path.join(__dirname, "intent_replay_dataset_2026-03-26.json");
const REPORT_PATH = path.join(__dirname, "intent_replay_results_2026-03-26.md");

const INTENTS = ["WHY", "WHEN", "ENTITY", "GENERAL"];

const WHY_PATTERNS = [
  /\bwhy\b/i,
  /\breason\b/i,
  /\bcause\b/i,
  /\bbecause\b/i,
  /\broot\s+cause\b/i,
  /\bhow\s+come\b/i,
  /为什么/,
  /为何/,
  /为啥/,
  /原因/,
  /起因/,
  /根因/,
  /怎么会/,
  /导致/,
  /造成/,
  /因果/,
];

const WHEN_PATTERNS = [
  /\bwhen\b/i,
  /\btime\b/i,
  /\bdate\b/i,
  /\btimeline\b/i,
  /\bbefore\b/i,
  /\bafter\b/i,
  /\bduring\b/i,
  /\byesterday\b/i,
  /\btoday\b/i,
  /\btomorrow\b/i,
  /\brecent(?:ly)?\b/i,
  /\blast\s+(?:night|week|month|year)\b/i,
  /\bthis\s+(?:morning|afternoon|evening|week|month|year)\b/i,
  /什么时候/,
  /何时/,
  /几点/,
  /哪天/,
  /日期/,
  /时间/,
  /多久/,
  /先后/,
  /之前/,
  /之后/,
  /期间/,
  /昨天/,
  /今天/,
  /明天/,
  /最近/,
  /近期/,
  /上周/,
  /上个月/,
  /去年/,
  /今年/,
];

const STRONG_ENTITY_PATTERNS = [
  /\bwho\b/i,
  /\bwhere\b/i,
  /谁/,
  /哪位/,
  /哪里/,
  /哪儿/,
];

const ENTITY_NOUN_PATTERNS = [
  /\bperson\b/i,
  /\bpeople\b/i,
  /\bteam\b/i,
  /\bproject\b/i,
  /\bfile\b/i,
  /\bdoc(?:ument)?\b/i,
  /\bentity\b/i,
  /\bmember\b/i,
  /\bowner\b/i,
  /\bmaintainer\b/i,
  /\brepo(?:sitory)?\b/i,
  /\bservice\b/i,
  /\bmodule\b/i,
  /\bcomponent\b/i,
  /\bname\b/i,
  /\blocation\b/i,
  /人员/,
  /成员/,
  /组织/,
  /团队/,
  /项目/,
  /文件/,
  /文档/,
  /实体/,
  /负责人/,
  /仓库/,
  /服务/,
  /模块/,
  /组件/,
  /名称/,
  /名字/,
  /地点/,
  /位置/,
];

const AMBIGUOUS_ENTITY_QUESTION_PATTERNS = [
  /\bwhat\b/i,
  /\bwhich\b/i,
  /什么/,
  /哪个/,
  /哪些/,
];

const ENTITY_HINT_PATTERNS = [
  /\bcalled\b/i,
  /\bowner\b/i,
  /\bowns?\b/i,
  /\bmaintainer\b/i,
  /\bresponsible\b/i,
  /\bbelong(?:s)?\b/i,
  /\blocation\b/i,
  /\baddress\b/i,
  /\bid\b/i,
  /\blist\b/i,
  /\bshow\b/i,
  /叫.?什么/,
  /名称/,
  /名字/,
  /负责人/,
  /归属/,
  /位于/,
  /地址/,
  /编号/,
  /列出/,
  /清单/,
  /有哪些/,
  /是谁/,
];

function zeroCounts() {
  return { support: 0, hit: 0, miss: 0, predicted: 0, precision: 0, recall: 0 };
}

function safeDiv(n, d) {
  return d === 0 ? 0 : n / d;
}

function pct(v) {
  return `${(v * 100).toFixed(2)}%`;
}

function matchesAny(text, patterns) {
  return patterns.some((pattern) => pattern.test(text));
}

function isEntityIntentT4(text) {
  if (matchesAny(text, STRONG_ENTITY_PATTERNS)) return true;

  const hasEntityNoun = matchesAny(text, ENTITY_NOUN_PATTERNS);
  if (hasEntityNoun) return true;

  const hasAmbiguousQuestion = matchesAny(text, AMBIGUOUS_ENTITY_QUESTION_PATTERNS);
  if (!hasAmbiguousQuestion) return false;

  return matchesAny(text, ENTITY_HINT_PATTERNS);
}

function detectQueryIntentT4(query) {
  if (typeof query !== "string") return "GENERAL";

  const normalized = query.trim();
  if (!normalized) return "GENERAL";

  if (matchesAny(normalized, WHY_PATTERNS)) return "WHY";
  if (matchesAny(normalized, WHEN_PATTERNS)) return "WHEN";
  if (isEntityIntentT4(normalized)) return "ENTITY";

  return "GENERAL";
}

function evaluate(dataset, detector) {
  const confusion = Object.fromEntries(
    INTENTS.map((actual) => [actual, Object.fromEntries(INTENTS.map((pred) => [pred, 0]))]),
  );
  const stats = Object.fromEntries(INTENTS.map((i) => [i, zeroCounts()]));

  const rows = [];
  let correct = 0;

  for (const item of dataset) {
    const actual = item.expected_intent;
    const predicted = detector(item.query);

    rows.push({ ...item, predicted, correct: actual === predicted });

    if (actual === predicted) correct += 1;

    if (!confusion[actual]) {
      throw new Error(`Unknown expected_intent '${actual}' in dataset item ${item.id}`);
    }

    confusion[actual][predicted] += 1;
    stats[actual].support += 1;
    stats[predicted].predicted += 1;
  }

  for (const intent of INTENTS) {
    const tp = confusion[intent][intent];
    const support = stats[intent].support;
    const predicted = stats[intent].predicted;
    const miss = support - tp;

    stats[intent].hit = tp;
    stats[intent].miss = miss;
    stats[intent].precision = safeDiv(tp, predicted);
    stats[intent].recall = safeDiv(tp, support);
  }

  const accuracy = safeDiv(correct, dataset.length);
  const misclassified = rows.filter((r) => !r.correct);

  return {
    samples: dataset.length,
    correct,
    accuracy,
    perIntent: stats,
    confusion,
    misclassifiedCount: misclassified.length,
    misclassified,
  };
}

function delta(a, b) {
  return (a - b) * 100;
}

function signedPctPoint(v) {
  const sign = v > 0 ? "+" : "";
  return `${sign}${v.toFixed(2)}pp`;
}

function pushMetricsSection(lines, title, metrics) {
  lines.push(`## ${title}`);
  lines.push("");
  lines.push(`- Samples: **${metrics.samples}**`);
  lines.push(`- Correct: **${metrics.correct}**`);
  lines.push(`- Overall accuracy: **${pct(metrics.accuracy)}**`);
  lines.push(`- Misclassified: **${metrics.misclassifiedCount}**`);
  lines.push("");
  lines.push("### Per-intent Metrics");
  lines.push("");
  lines.push("| Intent | Support | Predicted | Hit | Miss | Precision | Recall |");
  lines.push("|---|---:|---:|---:|---:|---:|---:|");
  for (const intent of INTENTS) {
    const s = metrics.perIntent[intent];
    lines.push(
      `| ${intent} | ${s.support} | ${s.predicted} | ${s.hit} | ${s.miss} | ${pct(s.precision)} | ${pct(s.recall)} |`,
    );
  }
  lines.push("");
  lines.push("### Confusion Matrix (actual -> predicted)");
  lines.push("");
  lines.push("| Actual \\ Pred | WHY | WHEN | ENTITY | GENERAL |");
  lines.push("|---|---:|---:|---:|---:|");
  for (const actual of INTENTS) {
    const row = metrics.confusion[actual];
    lines.push(`| ${actual} | ${row.WHY} | ${row.WHEN} | ${row.ENTITY} | ${row.GENERAL} |`);
  }
  lines.push("");
}

function buildComparison(baseline, current) {
  const out = {
    accuracyDeltaPctPoint: delta(current.accuracy, baseline.accuracy),
    perIntent: {},
    confusionShift: [],
    recoveredCases: [],
    regressedCases: [],
  };

  for (const intent of INTENTS) {
    out.perIntent[intent] = {
      precisionDeltaPctPoint: delta(current.perIntent[intent].precision, baseline.perIntent[intent].precision),
      recallDeltaPctPoint: delta(current.perIntent[intent].recall, baseline.perIntent[intent].recall),
      hitDelta: current.perIntent[intent].hit - baseline.perIntent[intent].hit,
      missDelta: current.perIntent[intent].miss - baseline.perIntent[intent].miss,
    };
  }

  for (const actual of INTENTS) {
    for (const pred of INTENTS) {
      if (actual === pred) continue;
      const d = current.confusion[actual][pred] - baseline.confusion[actual][pred];
      if (d !== 0) {
        out.confusionShift.push({ actual, predicted: pred, delta: d });
      }
    }
  }

  const baseById = new Map(baseline.misclassified.map((m) => [m.id, m]));
  const currById = new Map(current.misclassified.map((m) => [m.id, m]));

  for (const [id, row] of baseById) {
    if (!currById.has(id)) {
      out.recoveredCases.push({ id, from: `${row.expected_intent}->${row.predicted}`, query: row.query });
    }
  }

  for (const [id, row] of currById) {
    if (!baseById.has(id)) {
      out.regressedCases.push({ id, from: `${row.expected_intent}->${row.predicted}`, query: row.query });
    }
  }

  out.confusionShift.sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta));
  out.recoveredCases.sort((a, b) => a.id.localeCompare(b.id));
  out.regressedCases.sort((a, b) => a.id.localeCompare(b.id));
  return out;
}

function main() {
  const dataset = JSON.parse(fs.readFileSync(DATASET_PATH, "utf8"));

  const baseline = evaluate(dataset, detectQueryIntentT4);
  const current = evaluate(dataset, detectQueryIntentT5);
  const comparison = buildComparison(baseline, current);

  const lines = [];
  lines.push("# Intent Replay Evaluation Results (2026-03-26)");
  lines.push("");
  lines.push("## Summary");
  lines.push("");
  lines.push(`- Dataset: \`eval/intent_replay_dataset_2026-03-26.json\``);
  lines.push(`- Samples: **${dataset.length}**`);
  lines.push("- Baseline: **T4 (legacy decision order)**");
  lines.push("- Current: **T5 (GENERAL disambiguation added)**");
  lines.push(`- Accuracy (T4 -> T5): **${pct(baseline.accuracy)} -> ${pct(current.accuracy)} (${signedPctPoint(comparison.accuracyDeltaPctPoint)})**`);
  lines.push("");

  pushMetricsSection(lines, "T4 Baseline Metrics", baseline);
  pushMetricsSection(lines, "T5 Current Metrics", current);

  lines.push("## T4 vs T5 Delta");
  lines.push("");
  lines.push("### Per-intent Delta");
  lines.push("");
  lines.push("| Intent | Δ Precision | Δ Recall | Δ Hit | Δ Miss |");
  lines.push("|---|---:|---:|---:|---:|");
  for (const intent of INTENTS) {
    const d = comparison.perIntent[intent];
    lines.push(
      `| ${intent} | ${signedPctPoint(d.precisionDeltaPctPoint)} | ${signedPctPoint(d.recallDeltaPctPoint)} | ${d.hitDelta > 0 ? "+" : ""}${d.hitDelta} | ${d.missDelta > 0 ? "+" : ""}${d.missDelta} |`,
    );
  }
  lines.push("");

  lines.push("### Confusion Shift (off-diagonal)");
  lines.push("");
  lines.push("| Actual -> Predicted | Δ Count (T5 - T4) |");
  lines.push("|---|---:|");
  for (const c of comparison.confusionShift) {
    lines.push(`| ${c.actual} -> ${c.predicted} | ${c.delta > 0 ? "+" : ""}${c.delta} |`);
  }
  lines.push("");

  lines.push("### Case-level Shift");
  lines.push("");
  lines.push(`- Recovered mistakes (T4 wrong -> T5 correct): **${comparison.recoveredCases.length}**`);
  lines.push(`- New regressions (T4 correct -> T5 wrong): **${comparison.regressedCases.length}**`);
  lines.push("");

  const topRecovered = comparison.recoveredCases.slice(0, 10);
  const topRegressed = comparison.regressedCases.slice(0, 10);

  lines.push("#### Top Recovered");
  lines.push("");
  if (topRecovered.length === 0) {
    lines.push("None.");
  } else {
    lines.push("| ID | Shift | Query |");
    lines.push("|---|---|---|");
    for (const r of topRecovered) {
      lines.push(`| ${r.id} | ${r.from} -> ${r.from.split("->")[0]} | ${String(r.query).replace(/\|/g, "\\|")} |`);
    }
  }
  lines.push("");

  lines.push("#### Top Regressed");
  lines.push("");
  if (topRegressed.length === 0) {
    lines.push("None.");
  } else {
    lines.push("| ID | Shift | Query |");
    lines.push("|---|---|---|");
    for (const r of topRegressed) {
      lines.push(`| ${r.id} | ${r.from.split("->")[0]} -> ${r.from.split("->")[1]} | ${String(r.query).replace(/\|/g, "\\|")} |`);
    }
  }
  lines.push("");

  fs.writeFileSync(REPORT_PATH, `${lines.join("\n")}\n`, "utf8");

  const summary = {
    samples: dataset.length,
    baseline: {
      accuracy: baseline.accuracy,
      correct: baseline.correct,
      misclassified: baseline.misclassifiedCount,
      perIntent: baseline.perIntent,
      confusion: baseline.confusion,
    },
    current: {
      accuracy: current.accuracy,
      correct: current.correct,
      misclassified: current.misclassifiedCount,
      perIntent: current.perIntent,
      confusion: current.confusion,
    },
    comparison,
  };

  console.log(JSON.stringify(summary, null, 2));
  console.log(`\nWrote report: ${REPORT_PATH}`);
}

main();
