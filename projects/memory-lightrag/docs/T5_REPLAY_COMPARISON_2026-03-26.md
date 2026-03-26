# Intent Replay Comparison Report (T4 vs T5 vs T5.1-R2)

Date: 2026-03-26  
Scope: query intent routing replay + calibration evaluation (WHY/WHEN/ENTITY/GENERAL)

## Artifacts

- Replay dataset: `eval/intent_replay_dataset_2026-03-26.json` (120 samples)
- Calibration dataset: `eval/intent_calibration_dataset_2026-03-26.json` (24 hard mixed-intent samples)
- Eval runner: `eval/run-intent-replay-eval.mjs`
- Replay results: `eval/intent_replay_results_2026-03-26.md`
- Calibration results: `eval/intent_calibration_results_2026-03-26.md`

## Evaluation command

```bash
npm run eval:intent-replay
```

---

## Replay metrics (120 samples)

| Version | Correct | Accuracy | WHY Recall | WHEN Recall | ENTITY Recall | GENERAL Recall |
|---|---:|---:|---:|---:|---:|---:|
| T4 baseline | 98 | 81.67% | 87.50% | 100.00% | 95.83% | 62.50% |
| T5 current | 96 | 80.00% | 87.50% | 95.83% | 95.83% | 60.42% |
| T5.1-R2 scored routing | 106 | 88.33% | 87.50% | 100.00% | 95.83% | 79.17% |
| Δ (T5.1-R2 - T4) | +8 | +6.67pp | +0.00pp | +0.00pp | +0.00pp | +16.67pp |
| Δ (T5.1-R2 - T5) | +10 | +8.33pp | +0.00pp | +4.17pp | +0.00pp | +18.75pp |

Key replay confusion change vs T4:
- `GENERAL -> WHEN`: **-7**
- `GENERAL -> ENTITY`: **-1**

This is the main quality win: fewer GENERAL prompts misrouted into temporal/entity buckets.

---

## Calibration metrics (24 hard mixed-intent samples)

| Version | Correct | Accuracy | WHY Recall | WHEN Recall | ENTITY Recall | GENERAL Recall |
|---|---:|---:|---:|---:|---:|---:|
| T4 baseline | 20 | 83.33% | 100.00% | 100.00% | 100.00% | 33.33% |
| T5.1-R2 scored routing | 22 | 91.67% | 100.00% | 83.33% | 100.00% | 83.33% |
| Δ (T5.1-R2 - T4) | +2 | +8.33pp | +0.00pp | -16.67pp | +0.00pp | +50.00pp |

Interpretation:
- Calibration set confirms improved GENERAL disambiguation under hard mixed-intent prompts.
- Tradeoff exists: slight WHEN recall drop in this adversarial slice.

---

## Score diagnostics (T5.1-R2)

Replay (120):
- Margin: min 0.000 / p50 0.661 / p90 0.928 / mean 0.569
- Top score: min 0.250 / p50 0.754 / p90 0.950 / mean 0.713
- Low-margin (<0.08): 8 cases, 2 errors (25.00%)

Calibration (24):
- Margin: min 0.086 / p50 0.736 / p90 0.995 / mean 0.686
- Top score: min 0.475 / p50 0.835 / p90 0.997 / mean 0.800
- Low-margin (<0.08): 0 cases, 0 errors

---

## Gate check

Targets:
1. GENERAL recall >= 70%
2. Accuracy >= T4 - 1.0pp (>= 80.67%)

Replay gate result (T5.1-R2):
- GENERAL recall = **79.17%** ✅ PASS
- Accuracy = **88.33%** ✅ PASS

Overall gate decision: **PASS**

---

## Risks / follow-up

1. Residual false GENERAL for some WHY phrasing
   - Example: `what caused ...` can hit low-score fallback.
2. Slight WHEN sensitivity on calibration edge cases
   - Example: mixed `which date ...` style prompt can regress to GENERAL.
3. Calibration dataset is still synthetic and small (24)
   - Add real production-like samples for next calibration round.

Recommended next step:
- Add targeted lexical coverage for `what caused ...` WHY pattern and `which date ...` WHEN phrase, then re-check low-score bucket.
