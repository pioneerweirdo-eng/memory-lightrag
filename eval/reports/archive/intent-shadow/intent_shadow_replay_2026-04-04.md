# Intent Shadow Replay — 2026-04-04

## Configuration

- Datasets: `datasets\dev_visible.json`, `datasets\calibration_visible.json`, `datasets\confusion_routing_v1.json`
- Provider type: `http_classifier`
- Provider baseUrl: `http://127.0.0.1:7771`
- Shadow mode: `true`
- Min confidence: `0.6`

## Deterministic Baseline

- Samples: **160**
- Accuracy: **88.13%**

| Intent | Precision | Recall | Hit | Miss | Support |
|---|---:|---:|---:|---:|---:|
| WHY | 100.00% | 100.00% | 24 | 0 | 24 |
| WHEN | 70.73% | 90.63% | 29 | 3 | 32 |
| ENTITY | 88.24% | 100.00% | 30 | 0 | 30 |
| GENERAL | 95.08% | 78.38% | 58 | 16 | 74 |

## Model Prediction

- Samples: **160**
- Accuracy: **88.13%**

| Intent | Precision | Recall | Hit | Miss | Support |
|---|---:|---:|---:|---:|---:|
| WHY | 100.00% | 100.00% | 24 | 0 | 24 |
| WHEN | 70.73% | 90.63% | 29 | 3 | 32 |
| ENTITY | 88.24% | 100.00% | 30 | 0 | 30 |
| GENERAL | 95.08% | 78.38% | 58 | 16 | 74 |

## Selected Prediction

- Samples: **160**
- Accuracy: **88.13%**

| Intent | Precision | Recall | Hit | Miss | Support |
|---|---:|---:|---:|---:|---:|
| WHY | 100.00% | 100.00% | 24 | 0 | 24 |
| WHEN | 70.73% | 90.63% | 29 | 3 | 32 |
| ENTITY | 88.24% | 100.00% | 30 | 0 | 30 |
| GENERAL | 95.08% | 78.38% | 58 | 16 | 74 |

## Diagnostics

- Divergence from deterministic: **0**
- Model available count: **0**
- Model accuracy when available: **0.00%**
- Selected from model count: **0**
- Fallback count: **160**

## Sample Divergences

| ID | Expected | Deterministic | Model | Selected | Confidence | Provider | Fallback |
|---|---|---|---|---|---:|---|---|
