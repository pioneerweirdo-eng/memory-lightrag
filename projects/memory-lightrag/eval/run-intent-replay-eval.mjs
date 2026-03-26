import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { detectQueryIntent as detectQueryIntentT5, detectQueryIntentDetailed } from "../src/policy/query-intent.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const REPLAY_DATASET_PATH = path.join(__dirname, "intent_replay_dataset_2026-03-26.json");
const REPLAY_REPORT_PATH = path.join(__dirname, "intent_replay_results_2026-03-26.md");
const CALIBRATION_DATASET_PATH = path.join(__dirname, "intent_calibration_dataset_2026-03-26.json");
const CALIBRATION_REPORT_PATH = path.join(__dirname, "intent_calibration_results_2026-03-26.md");

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

const STRONG_ENTITY_PATTERNS = [/\bwho\b/i, /\bwhere\b/i, /谁/, /哪位/, /哪里/, /哪儿/];

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

const AMBIGUOUS_ENTITY_QUESTION_PATTERNS = [/\bwhat\b/i, /\bwhich\b/i, /什么/, /哪个/, /哪些/];

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

function fmt(v) {
  return Number(v).toFixed(3);
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

function summarizeScoring(detailed) {
  if (!detailed) return null;

  // Support both shapes:
  // 1) { intent, scoring: { ... } }
  // 2) { intent, rawScores, normalizedScores, topScore, secondScore, margin, minTopScore, minMargin, decisionIntent }
  const scoring = detailed.scoring ?? detailed;

  const topScore = Number(scoring.topScore);
  const margin = Number(scoring.margin);
  const minTopScore = Number(scoring.minTopScore ?? Number.NaN);
  const minMargin = Number(scoring.minMargin ?? Number.NaN);

  let decisionReason = scoring.decisionReason;
  if (!decisionReason) {
    if (scoring.decisionIntent === "GENERAL" && Number.isFinite(topScore) && Number.isFinite(minTopScore) && topScore < minTopScore) {
      decisionReason = "low-score";
    } else if (scoring.decisionIntent === "GENERAL" && Number.isFinite(margin) && Number.isFinite(minMargin) && margin < minMargin) {
      decisionReason = "low-margin";
    } else {
      decisionReason = "scored";
    }
  }

  return {
    topIntent: scoring.topIntent,
    decisionIntent: scoring.decisionIntent ?? detailed.intent,
    decisionReason,
    topScore: Number.isFinite(topScore) ? topScore : 0,
    secondScore: Number.isFinite(Number(scoring.secondScore)) ? Number(scoring.secondScore) : 0,
    margin: Number.isFinite(margin) ? margin : 0,
    scores: scoring.scores ?? scoring.rawScores ?? null,
    normalizedScores: scoring.normalizedScores ?? null,
  };
}

function evaluate(dataset, detector, detailsProvider = null) {
  const confusion = Object.fromEntries(
    INTENTS.map((actual) => [actual, Object.fromEntries(INTENTS.map((pred) => [pred, 0]))]),
  );
  const stats = Object.fromEntries(INTENTS.map((i) => [i, zeroCounts()]));

  const rows = [];
  let correct = 0;

  const scoreRows = [];

  for (const item of dataset) {
    const actual = item.expected_intent;
    const predicted = detector(item.query);
    const detail = detailsProvider ? detailsProvider(item.query) : null;
    const scoring = summarizeScoring(detail);

    rows.push({ ...item, predicted, correct: actual === predicted, scoring });

    if (scoring) {
      scoreRows.push({ ...item, predicted, actual, correct: actual === predicted, ...scoring });
    }

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

  const scoreDiagnostics = buildScoreDiagnostics(scoreRows);

  return {
    samples: dataset.length,
    correct,
    accuracy,
    perIntent: stats,
    confusion,
    misclassifiedCount: misclassified.length,
    misclassified,
    scoreDiagnostics,
  };
}

function buildScoreDiagnostics(scoreRows) {
  if (!Array.isArray(scoreRows) || scoreRows.length === 0) return null;

  const margins = scoreRows.map((r) => r.margin).filter((v) => Number.isFinite(v));
  const topScores = scoreRows.map((r) => r.topScore).filter((v) => Number.isFinite(v));

  const lowMarginThreshold = 0.08;
  const lowMarginRows = scoreRows.filter((r) => Number.isFinite(r.margin) && r.margin < lowMarginThreshold);
  const lowMarginErrors = lowMarginRows.filter((r) => !r.correct);

  const byReason = {};
  for (const row of scoreRows) {
    const key = row.decisionReason || "unknown";
    if (!byReason[key]) byReason[key] = { total: 0, errors: 0 };
    byReason[key].total += 1;
    if (!row.correct) byReason[key].errors += 1;
  }

  return {
    available: true,
    lowMarginThreshold,
    margin: {
      min: Math.min(...margins),
      p25: percentile(margins, 25),
      p50: percentile(margins, 50),
      p75: percentile(margins, 75),
      p90: percentile(margins, 90),
      max: Math.max(...margins),
      mean: mean(margins),
    },
    topScore: {
      min: Math.min(...topScores),
      p25: percentile(topScores, 25),
      p50: percentile(topScores, 50),
      p75: percentile(topScores, 75),
      p90: percentile(topScores, 90),
      max: Math.max(...topScores),
      mean: mean(topScores),
    },
    lowMargin: {
      total: lowMarginRows.length,
      errorCount: lowMarginErrors.length,
      errorRate: safeDiv(lowMarginErrors.length, lowMarginRows.length || 1),
      rows: lowMarginRows.slice(0, 20).map((r) => ({
        id: r.id,
        expected: r.actual,
        predicted: r.predicted,
        margin: r.margin,
        topScore: r.topScore,
        reason: r.decisionReason,
        query: r.query,
      })),
    },
    byReason,
  };
}

function percentile(values, p) {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const idx = (p / 100) * (sorted.length - 1);
  const lo = Math.floor(idx);
  const hi = Math.ceil(idx);
  if (lo === hi) return sorted[lo];
  const t = idx - lo;
  return sorted[lo] * (1 - t) + sorted[hi] * t;
}

function mean(values) {
  if (!values.length) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
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

  if (metrics.scoreDiagnostics?.available) {
    const d = metrics.scoreDiagnostics;
    lines.push("### Score Diagnostics");
    lines.push("");
    lines.push(`- Margin stats: min=${fmt(d.margin.min)}, p25=${fmt(d.margin.p25)}, p50=${fmt(d.margin.p50)}, p75=${fmt(d.margin.p75)}, p90=${fmt(d.margin.p90)}, max=${fmt(d.margin.max)}, mean=${fmt(d.margin.mean)}`);
    lines.push(`- Top-score stats: min=${fmt(d.topScore.min)}, p25=${fmt(d.topScore.p25)}, p50=${fmt(d.topScore.p50)}, p75=${fmt(d.topScore.p75)}, p90=${fmt(d.topScore.p90)}, max=${fmt(d.topScore.max)}, mean=${fmt(d.topScore.mean)}`);
    lines.push(`- Low-margin (<${fmt(d.lowMarginThreshold)}) cases: **${d.lowMargin.total}**; errors: **${d.lowMargin.errorCount}** (${pct(d.lowMargin.errorRate)})`);
    lines.push("");

    lines.push("#### Decision Reason Breakdown");
    lines.push("");
    lines.push("| Reason | Total | Errors | Error Rate |");
    lines.push("|---|---:|---:|---:|");
    for (const [reason, r] of Object.entries(d.byReason)) {
      lines.push(`| ${reason} | ${r.total} | ${r.errors} | ${pct(safeDiv(r.errors, r.total))} |`);
    }
    lines.push("");

    lines.push("#### Low-margin Error Samples");
    lines.push("");
    const lowErr = d.lowMargin.rows.filter((r) => r.expected !== r.predicted).slice(0, 10);
    if (lowErr.length === 0) {
      lines.push("None.");
    } else {
      lines.push("| ID | Expected | Predicted | Margin | TopScore | Reason | Query |");
      lines.push("|---|---|---|---:|---:|---|---|");
      for (const r of lowErr) {
        lines.push(
          `| ${r.id} | ${r.expected} | ${r.predicted} | ${fmt(r.margin)} | ${fmt(r.topScore)} | ${r.reason} | ${String(r.query).replace(/\|/g, "\\|")} |`,
        );
      }
    }
    lines.push("");
  }
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

function evaluateDataset(datasetPath, reportPath, title) {
  const dataset = JSON.parse(fs.readFileSync(datasetPath, "utf8"));

  const baseline = evaluate(dataset, detectQueryIntentT4);
  const current = evaluate(dataset, detectQueryIntentT5, (q) => detectQueryIntentDetailed(q));
  const comparison = buildComparison(baseline, current);

  const lines = [];
  lines.push(`# ${title}`);
  lines.push("");
  lines.push("## Summary");
  lines.push("");
  lines.push(`- Dataset: \`${path.relative(__dirname, datasetPath)}\``);
  lines.push(`- Samples: **${dataset.length}**`);
  lines.push("- Baseline: **T4 (legacy decision order)**");
  lines.push("- Current: **T5.1-R2 (scored routing)**");
  lines.push(
    `- Accuracy (T4 -> T5.1-R2): **${pct(baseline.accuracy)} -> ${pct(current.accuracy)} (${signedPctPoint(comparison.accuracyDeltaPctPoint)})**`,
  );
  lines.push("");

  pushMetricsSection(lines, "T4 Baseline Metrics", baseline);
  pushMetricsSection(lines, "T5.1-R2 Current Metrics", current);

  lines.push("## T4 vs T5.1-R2 Delta");
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
  lines.push("| Actual -> Predicted | Δ Count (T5.1-R2 - T4) |");
  lines.push("|---|---:|");
  if (comparison.confusionShift.length === 0) {
    lines.push("| (none) | 0 |");
  } else {
    for (const c of comparison.confusionShift) {
      lines.push(`| ${c.actual} -> ${c.predicted} | ${c.delta > 0 ? "+" : ""}${c.delta} |`);
    }
  }
  lines.push("");

  lines.push("### Case-level Shift");
  lines.push("");
  lines.push(`- Recovered mistakes (T4 wrong -> T5.1-R2 correct): **${comparison.recoveredCases.length}**`);
  lines.push(`- New regressions (T4 correct -> T5.1-R2 wrong): **${comparison.regressedCases.length}**`);
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

  fs.writeFileSync(reportPath, `${lines.join("\n")}\n`, "utf8");

  return {
    datasetPath,
    reportPath,
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
      scoreDiagnostics: current.scoreDiagnostics,
    },
    comparison,
  };
}

function main() {
  const replay = evaluateDataset(
    REPLAY_DATASET_PATH,
    REPLAY_REPORT_PATH,
    "Intent Replay Evaluation Results (2026-03-26)",
  );

  const calibration = evaluateDataset(
    CALIBRATION_DATASET_PATH,
    CALIBRATION_REPORT_PATH,
    "Intent Calibration Evaluation Results (2026-03-26)",
  );

  const summary = {
    replay,
    calibration,
  };

  console.log(JSON.stringify(summary, null, 2));
  console.log(`\nWrote report: ${REPLAY_REPORT_PATH}`);
  console.log(`Wrote report: ${CALIBRATION_REPORT_PATH}`);
}

main();
