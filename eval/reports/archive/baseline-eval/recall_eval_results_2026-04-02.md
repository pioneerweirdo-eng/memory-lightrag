# Recall Evaluation Report — 2026-04-02T06:57:06.988Z

## Configuration

| Parameter | Value |
|---|---|
| LightRAG | http://127.0.0.1:9621 |
| Dataset | recall_labeled_v1.json |
| Queries | 15 |
| Seeded insight records | 8 |

## Gate-Aligned Metrics

| Metric | Value | Target |
|---|---|---|
| Graph Grounded Recall Rate | 20.00% | >= 80% |
| Multi-hop Memory Accuracy | 18.18% | >= flat + 10pp |
| Temporal Consistency Accuracy | 12.50% | >= 75% |
| Correction Accuracy | 16.67% | diagnostic |
| Anchor Hit Rate | 100.00% | diagnostic |
| Provenance Completeness | 13.33% | diagnostic |
| Query-memory Reuse Rate | 0.00% | diagnostic |
| Insight Reuse Rate | 0.00% | diagnostic |

## Keyword Diagnostic

| Metric | Flat | Graph |
|---|---|---|
| Avg keyword hit rate | 12.22% | 6.67% |
| Graph wins | 0 | |
| Flat wins | 2 | |
| Same | 13 | |

## Per-Query Results

| Query | Grounded | Anchors | Ent | Rel | Temporal | Correction | QMem | Insight | Winner |
|---|---|---|---|---|---|---|---|---|---|
| RQ-001 | Y | 5 | 8 | 72 | 100.00% | 0 | 0 | 0 | SAME |
| RQ-002 | N | 5 | 0 | 0 | 50.00% | 0 | 0 | 0 | SAME |
| RQ-003 | N | 5 | 0 | 0 | 50.00% | 0 | 0 | 0 | SAME |
| RQ-004 | N | 5 | 0 | 0 | 15.00% | 0 | 0 | 0 | SAME |
| RQ-005 | Y | 5 | 12 | 32 | 50.00% | 0 | 0 | 0 | SAME |
| RQ-006 | N | 5 | 0 | 0 | 70.00% | 0 | 0 | 0 | FLAT |
| RQ-007 | N | 5 | 0 | 0 | 15.00% | 0 | 0 | 0 | SAME |
| RQ-008 | N | 5 | 0 | 0 | 15.00% | 0 | 0 | 0 | SAME |
| RQ-009 | N | 5 | 0 | 0 | 70.00% | 0 | 0 | 0 | SAME |
| RQ-010 | N | 5 | 0 | 0 | 15.00% | 0 | 0 | 0 | SAME |
| RQ-011 | N | 5 | 0 | 0 | 70.00% | 0 | 0 | 0 | FLAT |
| RQ-012 | N | 5 | 0 | 0 | 15.00% | 0 | 0 | 0 | SAME |
| RQ-013 | N | 5 | 0 | 0 | 50.00% | 0 | 0 | 0 | SAME |
| RQ-014 | Y | 5 | 4 | 64 | 15.00% | 1 | 0 | 0 | SAME |
| RQ-015 | N | 5 | 0 | 0 | 50.00% | 0 | 0 | 0 | SAME |

## Gate Decision

**⚠ P2 evidence package is not yet sufficient** — improve graph grounding, temporal consistency, and/or multi-hop retrieval before advancing the gate.

---
*Recall eval runner v2026-04-02 · gate-aligned metrics package*