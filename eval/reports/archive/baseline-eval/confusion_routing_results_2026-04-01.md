# Confusion Routing Evaluation Results (2026-04-01)

## Audit Header
- Dataset: `datasets\confusion_routing_v1.json`
- Samples: **46**
- Correct: **37**
- Overall Accuracy: **80.43%**

## Confusion Matrix
| Actual\Pred | WHY | WHEN | ENTITY | GENERAL | Support |
|---|---:|---:|---:|---:|---:|
| WHY | 0 | 0 | 0 | 0 | 0 |
| WHEN | 0 | 8 | 0 | 0 | 8 |
| ENTITY | 0 | 0 | 6 | 0 | 6 |
| GENERAL | 0 | 7 | 2 | 23 | 32 |

## Per-Intent Metrics
| Intent | Precision | Recall | Hit | Support |
|---|---:|---:|---:|---:|
| WHY | 0.00% | 0.00% | 0 | 0 |
| WHEN | 53.33% | 100.00% | 8 | 8 |
| ENTITY | 75.00% | 100.00% | 6 | 6 |
| GENERAL | 100.00% | 71.88% | 23 | 32 |

## Per-Tag Group Accuracy
| Tag Group | Accuracy | Correct | Total |
|---|---:|---:|---:|
| general-clear | 86.36% | 19 | 22 |
| confusion-GENERAL-WHEN | 71.43% | 10 | 14 |
| confusion-GENERAL-ENTITY | 80.00% | 8 | 10 |
| ambiguous | 0.00% | 0 | 0 |
| tie-break | 0.00% | 0 | 0 |
| when-clear | 0.00% | 0 | 0 |
| entity-clear | 0.00% | 0 | 0 |

## Tie-Break Rescue
- Attempted: **6**
- Rescued: **2**
- Rescue Rate: **33.33%**

## Ambiguous Fallback
- Total ambiguous: **6**
- Routed to GENERAL: **4**
- Safe fallback rate: **66.67%**

## Misclassified
| ID | Query | Expected | Predicted |
|---|---|---|---|
| CR-G004 | 列出最近值得关注的变化 | GENERAL | ENTITY |
| CR-GW003 | what changed recently in the retrieval pipeline | GENERAL | WHEN |
| CR-GW008 | 过去两周内大家关注的核心问题是什么 | GENERAL | WHEN |
| CR-AMB001 | recently, what has changed | GENERAL | WHEN |
| CR-AMB003 | anything interesting happen last week | GENERAL | WHEN |
| CR-TIE001 | when was the last time memory felt stable | GENERAL | WHEN |
| CR-TIE002 | 上次系统稳定是什么时候 | GENERAL | WHEN |
| CR-TIE003 | who was managing things when the issue happened | GENERAL | WHEN |
| CR-TIE004 | 出问题的时候负责人是谁 | GENERAL | ENTITY |
