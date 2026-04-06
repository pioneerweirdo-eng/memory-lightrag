# Intent Shadow Replay — 2026-04-04

## Configuration

- Datasets: `datasets\dev_visible.json`, `datasets\calibration_visible.json`, `datasets\confusion_routing_v1.json`
- Provider type: `python_stdio`
- Provider baseUrl: `http://127.0.0.1:7771`
- Provider artifactsDir: `tools/intent-classifier/hybrid-artifacts_augmented_v2/hybrid_with_dense`
- Shadow mode: `false`
- Min confidence: `0.6`
- Min confidence by intent: `{}`
- Min margin by intent: `{}`

## Deterministic Baseline

- Samples: **160**
- Accuracy: **88.75%**

| Intent | Precision | Recall | Hit | Miss | Support |
|---|---:|---:|---:|---:|---:|
| WHY | 100.00% | 100.00% | 24 | 0 | 24 |
| WHEN | 71.43% | 93.75% | 30 | 2 | 32 |
| ENTITY | 88.24% | 100.00% | 30 | 0 | 30 |
| GENERAL | 96.67% | 78.38% | 58 | 16 | 74 |

## Model Prediction

- Samples: **160**
- Accuracy: **99.38%**

| Intent | Precision | Recall | Hit | Miss | Support |
|---|---:|---:|---:|---:|---:|
| WHY | 100.00% | 100.00% | 24 | 0 | 24 |
| WHEN | 100.00% | 96.88% | 31 | 1 | 32 |
| ENTITY | 100.00% | 100.00% | 30 | 0 | 30 |
| GENERAL | 98.67% | 100.00% | 74 | 0 | 74 |

## Selected Prediction

- Samples: **160**
- Accuracy: **100.00%**

| Intent | Precision | Recall | Hit | Miss | Support |
|---|---:|---:|---:|---:|---:|
| WHY | 100.00% | 100.00% | 24 | 0 | 24 |
| WHEN | 100.00% | 100.00% | 32 | 0 | 32 |
| ENTITY | 100.00% | 100.00% | 30 | 0 | 30 |
| GENERAL | 100.00% | 100.00% | 74 | 0 | 74 |

## Diagnostics

- Divergence from deterministic: **19**
- Model available count: **160**
- Model accuracy when available: **99.38%**
- Selected from model count: **159**
- Fallback count: **1**

## Sample Divergences

| ID | Expected | Deterministic | Model | Selected | Confidence | Provider | Fallback |
|---|---|---|---|---|---:|---|---|
| Q021 | WHEN | GENERAL | WHEN | WHEN | 0.998 | python_stdio |  |
| Q086 | GENERAL | WHEN | GENERAL | GENERAL | 0.993 | python_stdio |  |
| Q095 | GENERAL | ENTITY | GENERAL | GENERAL | 0.989 | python_stdio |  |
| Q101 | GENERAL | WHEN | GENERAL | GENERAL | 0.993 | python_stdio |  |
| Q107 | GENERAL | ENTITY | GENERAL | GENERAL | 0.995 | python_stdio |  |
| Q108 | GENERAL | WHEN | GENERAL | GENERAL | 0.993 | python_stdio |  |
| C001 | GENERAL | WHEN | GENERAL | GENERAL | 0.988 | python_stdio |  |
| C003 | GENERAL | WHEN | GENERAL | GENERAL | 0.945 | python_stdio |  |
| C011 | WHEN | GENERAL | WHEN | WHEN | 0.970 | python_stdio |  |
| C017 | WHEN | WHEN | GENERAL | WHEN | 0.494 | deterministic | low_confidence |
| CR-G004 | GENERAL | ENTITY | GENERAL | GENERAL | 0.994 | python_stdio |  |
| CR-GW003 | GENERAL | WHEN | GENERAL | GENERAL | 0.994 | python_stdio |  |
| CR-GW008 | GENERAL | WHEN | GENERAL | GENERAL | 0.993 | python_stdio |  |
| CR-AMB001 | GENERAL | WHEN | GENERAL | GENERAL | 0.992 | python_stdio |  |
| CR-AMB003 | GENERAL | WHEN | GENERAL | GENERAL | 0.992 | python_stdio |  |
| CR-TIE001 | GENERAL | WHEN | GENERAL | GENERAL | 0.990 | python_stdio |  |
| CR-TIE002 | GENERAL | WHEN | GENERAL | GENERAL | 0.990 | python_stdio |  |
| CR-TIE003 | GENERAL | WHEN | GENERAL | GENERAL | 0.991 | python_stdio |  |
| CR-TIE004 | GENERAL | ENTITY | GENERAL | GENERAL | 0.987 | python_stdio |  |
