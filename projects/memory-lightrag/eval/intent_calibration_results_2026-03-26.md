# Intent Calibration Evaluation Results (2026-03-26)

## Summary

- Dataset: `intent_calibration_dataset_2026-03-26.json`
- Samples: **24**
- Baseline: **T4 (legacy decision order)**
- Current: **T5.1-R2 (scored routing)**
- Accuracy (T4 -> T5.1-R2): **83.33% -> 91.67% (+8.33pp)**

## T4 Baseline Metrics

- Samples: **24**
- Correct: **20**
- Overall accuracy: **83.33%**
- Misclassified: **4**

### Per-intent Metrics

| Intent | Support | Predicted | Hit | Miss | Precision | Recall |
|---|---:|---:|---:|---:|---:|---:|
| WHY | 6 | 6 | 6 | 0 | 100.00% | 100.00% |
| WHEN | 6 | 10 | 6 | 0 | 60.00% | 100.00% |
| ENTITY | 6 | 6 | 6 | 0 | 100.00% | 100.00% |
| GENERAL | 6 | 2 | 2 | 4 | 100.00% | 33.33% |

### Confusion Matrix (actual -> predicted)

| Actual \ Pred | WHY | WHEN | ENTITY | GENERAL |
|---|---:|---:|---:|---:|
| WHY | 6 | 0 | 0 | 0 |
| WHEN | 0 | 6 | 0 | 0 |
| ENTITY | 0 | 0 | 6 | 0 |
| GENERAL | 0 | 4 | 0 | 2 |

## T5.1-R2 Current Metrics

- Samples: **24**
- Correct: **22**
- Overall accuracy: **91.67%**
- Misclassified: **2**

### Per-intent Metrics

| Intent | Support | Predicted | Hit | Miss | Precision | Recall |
|---|---:|---:|---:|---:|---:|---:|
| WHY | 6 | 6 | 6 | 0 | 100.00% | 100.00% |
| WHEN | 6 | 6 | 5 | 1 | 83.33% | 83.33% |
| ENTITY | 6 | 6 | 6 | 0 | 100.00% | 100.00% |
| GENERAL | 6 | 6 | 5 | 1 | 83.33% | 83.33% |

### Confusion Matrix (actual -> predicted)

| Actual \ Pred | WHY | WHEN | ENTITY | GENERAL |
|---|---:|---:|---:|---:|
| WHY | 6 | 0 | 0 | 0 |
| WHEN | 0 | 5 | 0 | 1 |
| ENTITY | 0 | 0 | 6 | 0 |
| GENERAL | 0 | 1 | 0 | 5 |

### Score Diagnostics

- Margin stats: min=0.086, p25=0.385, p50=0.736, p75=0.927, p90=0.995, max=0.998, mean=0.686
- Top-score stats: min=0.475, p25=0.631, p50=0.835, p75=0.950, p90=0.997, max=0.999, mean=0.800
- Low-margin (<0.080) cases: **0**; errors: **0** (0.00%)

#### Decision Reason Breakdown

| Reason | Total | Errors | Error Rate |
|---|---:|---:|---:|
| scored | 24 | 2 | 8.33% |

#### Low-margin Error Samples

None.

## T4 vs T5.1-R2 Delta

### Per-intent Delta

| Intent | Δ Precision | Δ Recall | Δ Hit | Δ Miss |
|---|---:|---:|---:|---:|
| WHY | 0.00pp | 0.00pp | 0 | 0 |
| WHEN | +23.33pp | -16.67pp | -1 | +1 |
| ENTITY | 0.00pp | 0.00pp | 0 | 0 |
| GENERAL | -16.67pp | +50.00pp | +3 | -3 |

### Confusion Shift (off-diagonal)

| Actual -> Predicted | Δ Count (T5.1-R2 - T4) |
|---|---:|
| GENERAL -> WHEN | -3 |
| WHEN -> GENERAL | +1 |

### Case-level Shift

- Recovered mistakes (T4 wrong -> T5.1-R2 correct): **3**
- New regressions (T4 correct -> T5.1-R2 wrong): **1**

#### Top Recovered

| ID | Shift | Query |
|---|---|---|
| C001 | GENERAL->WHEN -> GENERAL | 总结一下昨天 incident 的关键进展 |
| C002 | GENERAL->WHEN -> GENERAL | which summary from last week should I share with leadership |
| C020 | GENERAL->WHEN -> GENERAL | 把最近讨论做个简短状态播报 |

#### Top Regressed

| ID | Shift | Query |
|---|---|---|
| C021 | WHEN -> GENERAL | which date did hybrid retrieval become default |

