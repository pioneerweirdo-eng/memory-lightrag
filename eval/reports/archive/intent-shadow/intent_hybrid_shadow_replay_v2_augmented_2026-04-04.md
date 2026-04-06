# Intent Hybrid Shadow Replay — 2026-04-04

## Configuration

- Dataset: `datasets\intent_trainset_v2_augmented.jsonl`
- Rows: **224**
- Sparse bootstrap predictions: `reports\intent_predictions_sparse_bootstrap_v2_augmented_2026-04-04.jsonl`
- Hybrid without dense predictions: `reports\intent_predictions_hybrid_without_dense_v2_augmented_2026-04-04.jsonl`
- Hybrid with dense predictions: `reports\intent_predictions_hybrid_with_dense_v2_augmented_2026-04-04.jsonl`

## Deterministic Baseline

- Samples: **224**
- Accuracy: **87.50%**

| Intent | Precision | Recall | Hit | Miss | Support |
|---|---:|---:|---:|---:|---:|
| WHY | 96.00% | 96.00% | 48 | 2 | 50 |
| WHEN | 70.37% | 92.68% | 38 | 3 | 41 |
| ENTITY | 88.64% | 92.86% | 39 | 3 | 42 |
| GENERAL | 93.42% | 78.02% | 71 | 20 | 91 |

| Expected ↓ / Predicted → | WHY | WHEN | ENTITY | GENERAL |
|---|---:|---:|---:|---:|
| WHY | 48 | 0 | 0 | 2 |
| WHEN | 0 | 38 | 0 | 3 |
| ENTITY | 1 | 2 | 39 | 0 |
| GENERAL | 1 | 14 | 5 | 71 |

## Deterministic Baseline WHY / ENTITY Boundary

- WHY -> ENTITY: **0**
- ENTITY -> WHY: **1**

## Deterministic Slice Metrics

| Slice | Samples | Accuracy |
|---|---:|---:|
| temporal | 61 | 85.25% |
| causal | 45 | 95.56% |
| participant_entity | 37 | 78.38% |
| recap | 49 | 85.71% |
| zh_en_mixed | 54 | 94.44% |

## Current Sparse Bootstrap

- Samples: **224**
- Accuracy: **93.30%**

| Intent | Precision | Recall | Hit | Miss | Support |
|---|---:|---:|---:|---:|---:|
| WHY | 96.00% | 96.00% | 48 | 2 | 50 |
| WHEN | 97.22% | 85.37% | 35 | 6 | 41 |
| ENTITY | 86.36% | 90.48% | 38 | 4 | 42 |
| GENERAL | 93.62% | 96.70% | 88 | 3 | 91 |

| Expected ↓ / Predicted → | WHY | WHEN | ENTITY | GENERAL |
|---|---:|---:|---:|---:|
| WHY | 48 | 0 | 2 | 0 |
| WHEN | 1 | 35 | 3 | 2 |
| ENTITY | 0 | 0 | 38 | 4 |
| GENERAL | 1 | 1 | 1 | 88 |

## Current Sparse Bootstrap WHY / ENTITY Boundary

- WHY -> ENTITY: **2**
- ENTITY -> WHY: **0**

## Current Sparse Bootstrap Slice Metrics

| Slice | Samples | Accuracy |
|---|---:|---:|
| temporal | 61 | 93.44% |
| causal | 45 | 95.56% |
| participant_entity | 37 | 89.19% |
| recap | 49 | 100.00% |
| zh_en_mixed | 54 | 94.44% |

## Current Sparse Bootstrap Representative Mistakes

### temporal-slice misrouted to GENERAL

_No examples in current replay._

### WHY -> ENTITY

| ID | Query | Expected | Deterministic | Sparse | HybridNoDense | HybridWithDense | Confidence | Signals |
|---|---|---|---|---|---|---|---:|---|
| AUGC003 | why did the fallback path still misroute the query | WHY | WHY | ENTITY | WHY | WHY | 1.000 | `{"why_anchor":2,"why_question":2,"summary_request":0,"temporal_explicit":0,"temporal_context":0,"temporal_change_anchor":0,"temporal_incident_anchor":0,"temporal_event_anchor":0,"causal_event_combo":0,"multi_hop_hint":0,"entity_strong":0,"entity_hint":0,"ambiguous_question":0,"relation_like":1,"inference_like":0,"policy_like":0,"research_like":0,"explicit_date":0,"mixed_language":0,"sparseCoverage":0.6667}` |
| AUGC008 | 因为啥 query-profile 会把这句看成 WHEN | WHY | WHY | ENTITY | WHY | WHY | 0.994 | `{"why_anchor":2,"why_question":1,"summary_request":0,"temporal_explicit":1,"temporal_context":0,"temporal_change_anchor":0,"temporal_incident_anchor":0,"temporal_event_anchor":0,"causal_event_combo":0,"multi_hop_hint":0,"entity_strong":0,"entity_hint":0,"ambiguous_question":0,"relation_like":0,"inference_like":0,"policy_like":0,"research_like":0,"explicit_date":0,"mixed_language":1,"sparseCoverage":0.75}` |

### ENTITY -> WHY

_No examples in current replay._

### ENTITY -> GENERAL

| ID | Query | Expected | Deterministic | Sparse | HybridNoDense | HybridWithDense | Confidence | Signals |
|---|---|---|---|---|---|---|---:|---|
| C022 | what file defines domain routing defaults | ENTITY | ENTITY | GENERAL | ENTITY | ENTITY | 0.878 | `{"why_anchor":0,"why_question":0,"summary_request":0,"temporal_explicit":0,"temporal_context":0,"temporal_change_anchor":0,"temporal_incident_anchor":0,"temporal_event_anchor":0,"causal_event_combo":0,"multi_hop_hint":0,"entity_strong":0,"entity_hint":0,"ambiguous_question":1,"relation_like":0,"inference_like":0,"policy_like":0,"research_like":0,"explicit_date":0,"mixed_language":0,"sparseCoverage":0.5}` |
| AUGT041 | 最近谁一直在改这个模块 | ENTITY | WHEN | GENERAL | ENTITY | ENTITY | 0.893 | `{"why_anchor":0,"why_question":0,"summary_request":0,"temporal_explicit":0,"temporal_context":1,"temporal_change_anchor":0,"temporal_incident_anchor":0,"temporal_event_anchor":0,"causal_event_combo":0,"multi_hop_hint":0,"entity_strong":1,"entity_hint":0,"ambiguous_question":0,"relation_like":0,"inference_like":0,"policy_like":0,"research_like":0,"explicit_date":0,"mixed_language":0,"sparseCoverage":0.8182}` |
| AUGC013 | 谁让这次回滚审批通过的 | ENTITY | ENTITY | GENERAL | ENTITY | ENTITY | 0.474 | `{"why_anchor":0,"why_question":0,"summary_request":0,"temporal_explicit":0,"temporal_context":0,"temporal_change_anchor":0,"temporal_incident_anchor":0,"temporal_event_anchor":0,"causal_event_combo":0,"multi_hop_hint":0,"entity_strong":1,"entity_hint":0,"ambiguous_question":0,"relation_like":0,"inference_like":0,"policy_like":0,"research_like":0,"explicit_date":0,"mixed_language":0,"sparseCoverage":0.7273}` |

### WHY tail cases

| ID | Query | Expected | Deterministic | Sparse | HybridNoDense | HybridWithDense | Confidence | Signals |
|---|---|---|---|---|---|---|---:|---|
| AUGC003 | why did the fallback path still misroute the query | WHY | WHY | ENTITY | WHY | WHY | 1.000 | `{"why_anchor":2,"why_question":2,"summary_request":0,"temporal_explicit":0,"temporal_context":0,"temporal_change_anchor":0,"temporal_incident_anchor":0,"temporal_event_anchor":0,"causal_event_combo":0,"multi_hop_hint":0,"entity_strong":0,"entity_hint":0,"ambiguous_question":0,"relation_like":1,"inference_like":0,"policy_like":0,"research_like":0,"explicit_date":0,"mixed_language":0,"sparseCoverage":0.6667}` |
| AUGC008 | 因为啥 query-profile 会把这句看成 WHEN | WHY | WHY | ENTITY | WHY | WHY | 0.994 | `{"why_anchor":2,"why_question":1,"summary_request":0,"temporal_explicit":1,"temporal_context":0,"temporal_change_anchor":0,"temporal_incident_anchor":0,"temporal_event_anchor":0,"causal_event_combo":0,"multi_hop_hint":0,"entity_strong":0,"entity_hint":0,"ambiguous_question":0,"relation_like":0,"inference_like":0,"policy_like":0,"research_like":0,"explicit_date":0,"mixed_language":1,"sparseCoverage":0.75}` |

## Hybrid Without Dense

- Samples: **224**
- Accuracy: **97.77%**

| Intent | Precision | Recall | Hit | Miss | Support |
|---|---:|---:|---:|---:|---:|
| WHY | 98.04% | 100.00% | 50 | 0 | 50 |
| WHEN | 100.00% | 90.24% | 37 | 4 | 41 |
| ENTITY | 97.67% | 100.00% | 42 | 0 | 42 |
| GENERAL | 96.77% | 98.90% | 90 | 1 | 91 |

| Expected ↓ / Predicted → | WHY | WHEN | ENTITY | GENERAL |
|---|---:|---:|---:|---:|
| WHY | 50 | 0 | 0 | 0 |
| WHEN | 0 | 37 | 1 | 3 |
| ENTITY | 0 | 0 | 42 | 0 |
| GENERAL | 1 | 0 | 0 | 90 |

## Hybrid Without Dense WHY / ENTITY Boundary

- WHY -> ENTITY: **0**
- ENTITY -> WHY: **0**

## Hybrid Without Dense Slice Metrics

| Slice | Samples | Accuracy |
|---|---:|---:|
| temporal | 61 | 96.72% |
| causal | 45 | 100.00% |
| participant_entity | 37 | 100.00% |
| recap | 49 | 100.00% |
| zh_en_mixed | 54 | 96.30% |

## Hybrid Without Dense Representative Mistakes

### temporal-slice misrouted to GENERAL

| ID | Query | Expected | Deterministic | Sparse | HybridNoDense | HybridWithDense | Confidence | Signals |
|---|---|---|---|---|---|---|---:|---|
| AUGC012 | 上次我们改 GENERAL guard 是什么时候 | WHEN | WHEN | WHEN | GENERAL | WHEN | 0.867 | `{"why_anchor":0,"why_question":0,"summary_request":0,"temporal_explicit":1,"temporal_context":0,"temporal_change_anchor":0,"temporal_incident_anchor":0,"temporal_event_anchor":0,"causal_event_combo":0,"multi_hop_hint":0,"entity_strong":0,"entity_hint":0,"ambiguous_question":1,"relation_like":0,"inference_like":0,"policy_like":0,"research_like":0,"explicit_date":0,"mixed_language":1,"sparseCoverage":0.8333}` |

### WHY -> ENTITY

_No examples in current replay._

### ENTITY -> WHY

_No examples in current replay._

### ENTITY -> GENERAL

_No examples in current replay._

### WHY tail cases

_No examples in current replay._

## Hybrid With Dense

- Samples: **224**
- Accuracy: **98.21%**

| Intent | Precision | Recall | Hit | Miss | Support |
|---|---:|---:|---:|---:|---:|
| WHY | 96.15% | 100.00% | 50 | 0 | 50 |
| WHEN | 100.00% | 95.12% | 39 | 2 | 41 |
| ENTITY | 97.67% | 100.00% | 42 | 0 | 42 |
| GENERAL | 98.89% | 97.80% | 89 | 2 | 91 |

| Expected ↓ / Predicted → | WHY | WHEN | ENTITY | GENERAL |
|---|---:|---:|---:|---:|
| WHY | 50 | 0 | 0 | 0 |
| WHEN | 0 | 39 | 1 | 1 |
| ENTITY | 0 | 0 | 42 | 0 |
| GENERAL | 2 | 0 | 0 | 89 |

## Hybrid With Dense WHY / ENTITY Boundary

- WHY -> ENTITY: **0**
- ENTITY -> WHY: **0**

## Hybrid With Dense Slice Metrics

| Slice | Samples | Accuracy |
|---|---:|---:|
| temporal | 61 | 96.72% |
| causal | 45 | 97.78% |
| participant_entity | 37 | 100.00% |
| recap | 49 | 100.00% |
| zh_en_mixed | 54 | 98.15% |

## Hybrid With Dense Representative Mistakes

### temporal-slice misrouted to GENERAL

_No examples in current replay._

### WHY -> ENTITY

_No examples in current replay._

### ENTITY -> WHY

_No examples in current replay._

### ENTITY -> GENERAL

_No examples in current replay._

### WHY tail cases

_No examples in current replay._

