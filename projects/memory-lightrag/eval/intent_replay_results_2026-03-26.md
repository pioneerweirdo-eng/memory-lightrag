# Intent Replay Evaluation Results (2026-03-26)

## Summary

- Dataset: `eval/intent_replay_dataset_2026-03-26.json`
- Samples: **120**
- Baseline: **T4 (legacy decision order)**
- Current: **T5 (GENERAL disambiguation added)**
- Accuracy (T4 -> T5): **81.67% -> 80.00% (-1.67pp)**

## T4 Baseline Metrics

- Samples: **120**
- Correct: **98**
- Overall accuracy: **81.67%**
- Misclassified: **22**

### Per-intent Metrics

| Intent | Support | Predicted | Hit | Miss | Precision | Recall |
|---|---:|---:|---:|---:|---:|---:|
| WHY | 24 | 22 | 21 | 3 | 95.45% | 87.50% |
| WHEN | 24 | 40 | 24 | 0 | 60.00% | 100.00% |
| ENTITY | 24 | 26 | 23 | 1 | 88.46% | 95.83% |
| GENERAL | 48 | 32 | 30 | 18 | 93.75% | 62.50% |

### Confusion Matrix (actual -> predicted)

| Actual \ Pred | WHY | WHEN | ENTITY | GENERAL |
|---|---:|---:|---:|---:|
| WHY | 21 | 1 | 0 | 2 |
| WHEN | 0 | 24 | 0 | 0 |
| ENTITY | 0 | 1 | 23 | 0 |
| GENERAL | 1 | 14 | 3 | 30 |

## T5 Current Metrics

- Samples: **120**
- Correct: **96**
- Overall accuracy: **80.00%**
- Misclassified: **24**

### Per-intent Metrics

| Intent | Support | Predicted | Hit | Miss | Precision | Recall |
|---|---:|---:|---:|---:|---:|---:|
| WHY | 24 | 22 | 21 | 3 | 95.45% | 87.50% |
| WHEN | 24 | 39 | 23 | 1 | 58.97% | 95.83% |
| ENTITY | 24 | 27 | 23 | 1 | 85.19% | 95.83% |
| GENERAL | 48 | 32 | 29 | 19 | 90.63% | 60.42% |

### Confusion Matrix (actual -> predicted)

| Actual \ Pred | WHY | WHEN | ENTITY | GENERAL |
|---|---:|---:|---:|---:|
| WHY | 21 | 1 | 0 | 2 |
| WHEN | 0 | 23 | 0 | 1 |
| ENTITY | 0 | 1 | 23 | 0 |
| GENERAL | 1 | 14 | 4 | 29 |

## T4 vs T5 Delta

### Per-intent Delta

| Intent | Δ Precision | Δ Recall | Δ Hit | Δ Miss |
|---|---:|---:|---:|---:|
| WHY | 0.00pp | 0.00pp | 0 | 0 |
| WHEN | -1.03pp | -4.17pp | -1 | +1 |
| ENTITY | -3.28pp | 0.00pp | 0 | 0 |
| GENERAL | -3.13pp | -2.08pp | -1 | +1 |

### Confusion Shift (off-diagonal)

| Actual -> Predicted | Δ Count (T5 - T4) |
|---|---:|
| WHEN -> GENERAL | +1 |
| GENERAL -> ENTITY | +1 |

### Case-level Shift

- Recovered mistakes (T4 wrong -> T5 correct): **0**
- New regressions (T4 correct -> T5 wrong): **2**

#### Top Recovered

None.

#### Top Regressed

| ID | Shift | Query |
|---|---|---|
| Q037 | GENERAL -> ENTITY | 列出最值得关注的三条进展 |
| Q060 | WHEN -> GENERAL | at what time did p95 latency peak |

