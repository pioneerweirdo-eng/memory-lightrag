# Intent Shadow Replay — 2026-04-04

## Configuration

- Datasets: `datasets\dev_visible.json`, `datasets\calibration_visible.json`, `datasets\confusion_routing_v1.json`
- Provider type: `http_classifier`
- Provider baseUrl: `http://127.0.0.1:7781`
- Shadow mode: `false`
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
- Accuracy: **98.13%**

| Intent | Precision | Recall | Hit | Miss | Support |
|---|---:|---:|---:|---:|---:|
| WHY | 100.00% | 100.00% | 24 | 0 | 24 |
| WHEN | 100.00% | 90.63% | 29 | 3 | 32 |
| ENTITY | 100.00% | 100.00% | 30 | 0 | 30 |
| GENERAL | 96.10% | 100.00% | 74 | 0 | 74 |

## Selected Prediction

- Samples: **160**
- Accuracy: **99.38%**

| Intent | Precision | Recall | Hit | Miss | Support |
|---|---:|---:|---:|---:|---:|
| WHY | 100.00% | 100.00% | 24 | 0 | 24 |
| WHEN | 100.00% | 96.88% | 31 | 1 | 32 |
| ENTITY | 100.00% | 100.00% | 30 | 0 | 30 |
| GENERAL | 98.67% | 100.00% | 74 | 0 | 74 |

## Diagnostics

- Divergence from deterministic: **22**
- Model available count: **160**
- Model accuracy when available: **98.13%**
- Selected from model count: **158**
- Fallback count: **2**

## Sample Divergences

| ID | Expected | Deterministic | Model | Selected | Confidence | Provider | Fallback |
|---|---|---|---|---|---:|---|---|
| Q021 | WHEN | GENERAL | WHEN | WHEN | 1.000 | http_classifier |  |
| Q060 | WHEN | WHEN | GENERAL | WHEN | 0.443 | deterministic | low_confidence |
| Q086 | GENERAL | WHEN | GENERAL | GENERAL | 1.000 | http_classifier |  |
| Q095 | GENERAL | ENTITY | GENERAL | GENERAL | 1.000 | http_classifier |  |
| Q101 | GENERAL | WHEN | GENERAL | GENERAL | 1.000 | http_classifier |  |
| Q107 | GENERAL | ENTITY | GENERAL | GENERAL | 1.000 | http_classifier |  |
| Q108 | GENERAL | WHEN | GENERAL | GENERAL | 0.999 | http_classifier |  |
| C001 | GENERAL | WHEN | GENERAL | GENERAL | 0.991 | http_classifier |  |
| C003 | GENERAL | WHEN | GENERAL | GENERAL | 0.957 | http_classifier |  |
| C009 | WHEN | WHEN | GENERAL | WHEN | 0.443 | deterministic | low_confidence |
| C011 | WHEN | GENERAL | WHEN | WHEN | 0.897 | http_classifier |  |
| C017 | WHEN | WHEN | GENERAL | GENERAL | 0.954 | http_classifier |  |
| C021 | WHEN | GENERAL | WHEN | WHEN | 0.936 | http_classifier |  |
| CR-G004 | GENERAL | ENTITY | GENERAL | GENERAL | 1.000 | http_classifier |  |
| CR-GW003 | GENERAL | WHEN | GENERAL | GENERAL | 1.000 | http_classifier |  |
| CR-GW008 | GENERAL | WHEN | GENERAL | GENERAL | 1.000 | http_classifier |  |
| CR-AMB001 | GENERAL | WHEN | GENERAL | GENERAL | 1.000 | http_classifier |  |
| CR-AMB003 | GENERAL | WHEN | GENERAL | GENERAL | 1.000 | http_classifier |  |
| CR-TIE001 | GENERAL | WHEN | GENERAL | GENERAL | 1.000 | http_classifier |  |
| CR-TIE002 | GENERAL | WHEN | GENERAL | GENERAL | 1.000 | http_classifier |  |
