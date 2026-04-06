# Intent Hybrid Shadow Replay — 2026-04-04

## Configuration

- Dataset: `datasets\intent_trainset_v1.jsonl`
- Rows: **148**
- Sparse bootstrap predictions: `reports\intent_predictions_sparse_bootstrap_2026-04-04.jsonl`
- Hybrid without dense predictions: `reports\intent_predictions_hybrid_without_dense_2026-04-04.jsonl`
- Hybrid with dense predictions: _not provided_

## Deterministic Baseline

- Samples: **148**
- Accuracy: **87.16%**

| Intent | Precision | Recall | Hit | Miss | Support |
|---|---:|---:|---:|---:|---:|
| WHY | 100.00% | 100.00% | 24 | 0 | 24 |
| WHEN | 66.67% | 88.89% | 24 | 3 | 27 |
| ENTITY | 86.21% | 100.00% | 25 | 0 | 25 |
| GENERAL | 94.92% | 77.78% | 56 | 16 | 72 |

| Expected ↓ / Predicted → | WHY | WHEN | ENTITY | GENERAL |
|---|---:|---:|---:|---:|
| WHY | 24 | 0 | 0 | 0 |
| WHEN | 0 | 24 | 0 | 3 |
| ENTITY | 0 | 0 | 25 | 0 |
| GENERAL | 0 | 12 | 4 | 56 |

## Deterministic Baseline WHY / ENTITY Boundary

- WHY -> ENTITY: **0**
- ENTITY -> WHY: **0**

## Deterministic Slice Metrics

| Slice | Samples | Accuracy |
|---|---:|---:|
| temporal | 41 | 80.49% |
| causal | 22 | 100.00% |
| participant_entity | 21 | 85.71% |
| recap | 44 | 86.36% |
| zh_en_mixed | 20 | 95.00% |

## Current Sparse Bootstrap

- Samples: **148**
- Accuracy: **93.92%**

| Intent | Precision | Recall | Hit | Miss | Support |
|---|---:|---:|---:|---:|---:|
| WHY | 100.00% | 87.50% | 21 | 3 | 24 |
| WHEN | 92.00% | 85.19% | 23 | 4 | 27 |
| ENTITY | 92.59% | 100.00% | 25 | 0 | 25 |
| GENERAL | 93.33% | 97.22% | 70 | 2 | 72 |

| Expected ↓ / Predicted → | WHY | WHEN | ENTITY | GENERAL |
|---|---:|---:|---:|---:|
| WHY | 21 | 1 | 0 | 2 |
| WHEN | 0 | 23 | 1 | 3 |
| ENTITY | 0 | 0 | 25 | 0 |
| GENERAL | 0 | 1 | 1 | 70 |

## Current Sparse Bootstrap WHY / ENTITY Boundary

- WHY -> ENTITY: **0**
- ENTITY -> WHY: **0**

## Current Sparse Bootstrap Slice Metrics

| Slice | Samples | Accuracy |
|---|---:|---:|
| temporal | 41 | 95.12% |
| causal | 22 | 86.36% |
| participant_entity | 21 | 95.24% |
| recap | 44 | 97.73% |
| zh_en_mixed | 20 | 100.00% |

## Current Sparse Bootstrap Representative Mistakes

### temporal-slice misrouted to GENERAL

| ID | Query | Expected | Deterministic | Sparse | HybridNoDense | HybridWithDense | Confidence | Signals |
|---|---|---|---|---|---|---|---:|---|
| C006 | why did retrieval quality drop after adding entity boost | WHY | WHY | GENERAL | WHY |  | 0.831 | `{"why_anchor":2,"why_question":2,"summary_request":0,"temporal_explicit":1,"temporal_context":0,"temporal_change_anchor":0,"temporal_incident_anchor":0,"temporal_event_anchor":0,"causal_event_combo":0,"entity_strong":0,"entity_hint":0,"ambiguous_question":0,"relation_like":1,"inference_like":0,"policy_like":0,"research_like":0,"explicit_date":0,"mixed_language":0,"sparseCoverage":0.6667}` |

### WHY -> ENTITY

_No examples in current replay._

### ENTITY -> WHY

_No examples in current replay._

### ENTITY -> GENERAL

_No examples in current replay._

### WHY tail cases

| ID | Query | Expected | Deterministic | Sparse | HybridNoDense | HybridWithDense | Confidence | Signals |
|---|---|---|---|---|---|---|---:|---|
| C005 | 这次回滚为什么会触发连锁告警 | WHY | WHY | WHEN | WHEN |  | 0.553 | `{"why_anchor":1,"why_question":2,"summary_request":0,"temporal_explicit":0,"temporal_context":0,"temporal_change_anchor":0,"temporal_incident_anchor":1,"temporal_event_anchor":1,"causal_event_combo":1,"entity_strong":0,"entity_hint":0,"ambiguous_question":0,"relation_like":0,"inference_like":0,"policy_like":0,"research_like":0,"explicit_date":0,"mixed_language":0,"sparseCoverage":0.7857}` |
| C006 | why did retrieval quality drop after adding entity boost | WHY | WHY | GENERAL | WHY |  | 0.831 | `{"why_anchor":2,"why_question":2,"summary_request":0,"temporal_explicit":1,"temporal_context":0,"temporal_change_anchor":0,"temporal_incident_anchor":0,"temporal_event_anchor":0,"causal_event_combo":0,"entity_strong":0,"entity_hint":0,"ambiguous_question":0,"relation_like":1,"inference_like":0,"policy_like":0,"research_like":0,"explicit_date":0,"mixed_language":0,"sparseCoverage":0.6667}` |
| C019 | what is the reason this summary got verbose | WHY | WHY | GENERAL | WHY |  | 0.837 | `{"why_anchor":1,"why_question":0,"summary_request":1,"temporal_explicit":0,"temporal_context":0,"temporal_change_anchor":0,"temporal_incident_anchor":0,"temporal_event_anchor":0,"causal_event_combo":0,"entity_strong":0,"entity_hint":0,"ambiguous_question":1,"relation_like":0,"inference_like":0,"policy_like":0,"research_like":0,"explicit_date":0,"mixed_language":0,"sparseCoverage":0.875}` |

## Hybrid Without Dense

- Samples: **148**
- Accuracy: **97.30%**

| Intent | Precision | Recall | Hit | Miss | Support |
|---|---:|---:|---:|---:|---:|
| WHY | 100.00% | 95.83% | 23 | 1 | 24 |
| WHEN | 96.00% | 88.89% | 24 | 3 | 27 |
| ENTITY | 96.15% | 100.00% | 25 | 0 | 25 |
| GENERAL | 97.30% | 100.00% | 72 | 0 | 72 |

| Expected ↓ / Predicted → | WHY | WHEN | ENTITY | GENERAL |
|---|---:|---:|---:|---:|
| WHY | 23 | 1 | 0 | 0 |
| WHEN | 0 | 24 | 1 | 2 |
| ENTITY | 0 | 0 | 25 | 0 |
| GENERAL | 0 | 0 | 0 | 72 |

## Hybrid Without Dense WHY / ENTITY Boundary

- WHY -> ENTITY: **0**
- ENTITY -> WHY: **0**

## Hybrid Without Dense Slice Metrics

| Slice | Samples | Accuracy |
|---|---:|---:|
| temporal | 41 | 100.00% |
| causal | 22 | 95.45% |
| participant_entity | 21 | 100.00% |
| recap | 44 | 100.00% |
| zh_en_mixed | 20 | 100.00% |

## Hybrid Without Dense Representative Mistakes

### temporal-slice misrouted to GENERAL

_No examples in current replay._

### WHY -> ENTITY

_No examples in current replay._

### ENTITY -> WHY

_No examples in current replay._

### ENTITY -> GENERAL

_No examples in current replay._

### WHY tail cases

| ID | Query | Expected | Deterministic | Sparse | HybridNoDense | HybridWithDense | Confidence | Signals |
|---|---|---|---|---|---|---|---:|---|
| C005 | 这次回滚为什么会触发连锁告警 | WHY | WHY | WHEN | WHEN |  | 0.494 | `{"why_anchor":1,"why_question":2,"summary_request":0,"temporal_explicit":0,"temporal_context":0,"temporal_change_anchor":0,"temporal_incident_anchor":1,"temporal_event_anchor":1,"causal_event_combo":3,"multi_hop_hint":1,"entity_strong":0,"entity_hint":0,"ambiguous_question":0,"relation_like":1,"inference_like":0,"policy_like":0,"research_like":0,"explicit_date":0,"mixed_language":0,"sparseCoverage":0.7857}` |

