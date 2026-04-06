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
- Accuracy: **71.25%**

| Intent | Precision | Recall | Hit | Miss | Support |
|---|---:|---:|---:|---:|---:|
| WHY | 60.71% | 70.83% | 17 | 7 | 24 |
| WHEN | 88.89% | 50.00% | 16 | 16 | 32 |
| ENTITY | 60.00% | 90.00% | 27 | 3 | 30 |
| GENERAL | 78.26% | 72.97% | 54 | 20 | 74 |

## Selected Prediction

- Samples: **160**
- Accuracy: **92.50%**

| Intent | Precision | Recall | Hit | Miss | Support |
|---|---:|---:|---:|---:|---:|
| WHY | 100.00% | 95.83% | 23 | 1 | 24 |
| WHEN | 83.78% | 96.88% | 31 | 1 | 32 |
| ENTITY | 85.71% | 100.00% | 30 | 0 | 30 |
| GENERAL | 98.46% | 86.49% | 64 | 10 | 74 |

## Diagnostics

- Divergence from deterministic: **58**
- Model available count: **159**
- Model accuracy when available: **71.07%**
- Selected from model count: **92**
- Fallback count: **68**

## Sample Divergences

| ID | Expected | Deterministic | Model | Selected | Confidence | Provider | Fallback |
|---|---|---|---|---|---:|---|---|
| Q003 | WHY | WHY | GENERAL | WHY | 0.480 | deterministic | low_confidence |
| Q005 | WHY | WHY | WHEN | WHEN | 0.612 | python_stdio |  |
| Q007 | WHY | WHY | ENTITY | WHY | 0.445 | deterministic | low_confidence |
| Q010 | WHY | WHY | GENERAL | WHY | 0.301 | deterministic | low_confidence |
| Q046 | WHY | WHY | WHEN | WHY | 0.312 | deterministic | low_confidence |
| Q048 | WHY | WHY | ENTITY | WHY | 0.451 | deterministic | low_confidence |
| Q012 | WHEN | WHEN | GENERAL | WHEN | 0.487 | deterministic | low_confidence |
| Q014 | WHEN | WHEN | GENERAL | WHEN | 0.490 | deterministic | low_confidence |
| Q016 | WHEN | WHEN | GENERAL | WHEN | 0.320 | deterministic | low_confidence |
| Q018 | WHEN | WHEN | ENTITY | WHEN | 0.392 | deterministic | low_confidence |
| Q020 | WHEN | WHEN | GENERAL | WHEN | 0.470 | deterministic | low_confidence |
| Q021 | WHEN | GENERAL | ENTITY | GENERAL | 0.318 | deterministic | low_confidence |
| Q022 | WHEN | WHEN | ENTITY | WHEN | 0.456 | deterministic | low_confidence |
| Q059 | WHEN | WHEN | GENERAL | WHEN | 0.336 | deterministic | low_confidence |
| Q063 | WHEN | WHEN | WHY | WHEN | 0.305 | deterministic | low_confidence |
| Q028 | ENTITY | ENTITY | GENERAL | ENTITY | 0.407 | deterministic | low_confidence |
| Q031 | ENTITY | ENTITY | WHY | ENTITY | 0.338 | deterministic | low_confidence |
| Q034 | GENERAL | GENERAL | WHY | GENERAL | 0.457 | deterministic | low_confidence |
| Q037 | GENERAL | GENERAL | ENTITY | GENERAL | 0.379 | deterministic | low_confidence |
| Q040 | GENERAL | GENERAL | WHY | GENERAL | 0.336 | deterministic | low_confidence |
