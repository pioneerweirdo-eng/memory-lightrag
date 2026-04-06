# EvidenceGroup Shadow Ranking - 2026-04-06

Offline shadow experiment for EvidenceGroup selection.

## Setup

- Cases: 25
- Visible gold-group cases: 25
- Competitive cases: 24
- Sources: recall_labeled_v1 synthetic generation + memory_method_comparison scenarios
- Runtime impact: none (eval-only shadow reranking)

## Results

| Method | Visible Hit@1 | Competitive Hit@1 | Competitive MRR |
|---|---:|---:|---:|
| baseline_group_score | 100.00% | 100.00% | 1.0000 |
| shadow_logreg_group_ranker | 100.00% | 100.00% | 1.0000 |

## Confidence Calibration Probe

| Method | Top-Group ECE |
|---|---:|
| baseline_group_score | 0.4537 |
| shadow_logreg_group_ranker | 0.1639 |

### Baseline Calibration Bins

| Score Bin | Count | Avg Score | Accuracy |
|---|---:|---:|---:|
| [0.2, 0.4) | 1 | 0.3574 | 1.0000 |
| [0.4, 0.6) | 20 | 0.5369 | 1.0000 |
| [0.6, 0.8) | 4 | 0.6407 | 1.0000 |

## Model Signal

- relatedEntityCount: 1.1603
- anchorMaxConfidenceScore: 1.0400
- groupScore: 1.0342
- route_why: 0.8173
- anchorMaxRankScore: 0.6241
- anchorAvgRankScore: 0.6098
- route_entity: 0.5350
- anchorCount: 0.4551

## Notable Cases

- No baseline/shadow disagreement on current visible competitive cases.

## Competitive Case Snapshot

- RQ-001 | recall_labeled_v1 | visible=Y | baseline=primary_subject::generic::entity:memory_lightrag_lightrag (r=1) | shadow=primary_subject::generic::entity:memory_lightrag_lightrag (r=1) | answer=28 March 2026
- RQ-002 | recall_labeled_v1 | visible=Y | baseline=owner:team::generic::entity:precision_time_window (r=1) | shadow=owner:team::generic::entity:precision_time_window (r=1) | answer=precision time window
- RQ-003 | recall_labeled_v1 | visible=Y | baseline=primary_subject::generic::entity:session_logs_official_workflow (r=1) | shadow=primary_subject::generic::entity:session_logs_official_workflow (r=1) | answer=session-logs official workflow
- RQ-004 | recall_labeled_v1 | visible=Y | baseline=primary_subject::generic::entity:embedding_model_version_mismatch (r=1) | shadow=primary_subject::generic::entity:embedding_model_version_mismatch (r=1) | answer=25 March 2026
- RQ-005 | recall_labeled_v1 | visible=Y | baseline=owner:team::generic::entity:selective_adoption_lightrag (r=1) | shadow=owner:team::generic::entity:selective_adoption_lightrag (r=1) | answer=selective adoption LightRAG
- RQ-006 | recall_labeled_v1 | visible=Y | baseline=primary_subject::generic::entity:general_when_production (r=1) | shadow=primary_subject::generic::entity:general_when_production (r=1) | answer=10 March 2026
- RQ-008 | recall_labeled_v1 | visible=Y | baseline=primary_subject::generic::entity:path_confusion_workspace_docs (r=1) | shadow=primary_subject::generic::entity:path_confusion_workspace_docs (r=1) | answer=27 March 2026
- RQ-009 | recall_labeled_v1 | visible=Y | baseline=owner:team::generic::entity:live_accuracy_offline_eval (r=1) | shadow=owner:team::generic::entity:live_accuracy_offline_eval (r=1) | answer=13 March 2026
- RQ-010 | recall_labeled_v1 | visible=Y | baseline=primary_subject::generic::entity:gate3_production_ready (r=1) | shadow=primary_subject::generic::entity:gate3_production_ready (r=1) | answer=31 March 2026
- RQ-011 | recall_labeled_v1 | visible=Y | baseline=primary_subject::generic::entity:plugin_loading_export_path_compatibility (r=1) | shadow=primary_subject::generic::entity:plugin_loading_export_path_compatibility (r=1) | answer=6 April 2026
- RQ-012 | recall_labeled_v1 | visible=Y | baseline=primary_subject::generic::entity:general_entity_when_general (r=1) | shadow=primary_subject::generic::entity:general_entity_when_general (r=1) | answer=24 March 2026
- RQ-013 | recall_labeled_v1 | visible=Y | baseline=owner:team::generic::entity:confusion_pairs_8_examples (r=1) | shadow=owner:team::generic::entity:confusion_pairs_8_examples (r=1) | answer=confusion pairs 8 examples
- RQ-014 | recall_labeled_v1 | visible=Y | baseline=primary_subject::generic::entity:intent_routing_production_deployment (r=1) | shadow=primary_subject::generic::entity:intent_routing_production_deployment (r=1) | answer=23 March 2026
- RQ-015 | recall_labeled_v1 | visible=Y | baseline=owner:team::generic::entity:8_documented_examples_evaluation_dataset (r=1) | shadow=owner:team::generic::entity:8_documented_examples_evaluation_dataset (r=1) | answer=8 documented examples evaluation dataset
- MC-S1A | memory_method_comparison | visible=Y | baseline=primary_subject::generic::anchor:ep_when_recent (r=1) | shadow=primary_subject::generic::anchor:ep_when_recent (r=1) | answer=5 April 2026

## Reading

- Current heuristic visible-case Hit@1: 100.00%.
- Shadow group ranker visible-case Hit@1: 100.00%.
- Current heuristic competitive-case Hit@1: 100.00%.
- Shadow group ranker competitive-case Hit@1: 100.00%.
- Baseline top-group ECE on visible cases: 0.4537.
- Shadow top-group ECE on visible cases: 0.1639.
- Because the evaluation bank mixes systematic synthetic recall cases with existing memory-semantics scenarios, treat this as a shadow headroom probe, not production proof.
- If the shadow scorer shows stable gains here, the next step should be a larger labeled EvidenceGroup benchmark rather than immediate runtime replacement.
