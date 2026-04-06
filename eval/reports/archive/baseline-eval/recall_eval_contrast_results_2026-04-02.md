# Recall Contrast Evaluation Report — 2026-04-03T14:19:53.890Z

## Configuration

| Parameter | Value |
|---|---|
| LightRAG | http://127.0.0.1:9621 |
| Dataset | recall_labeled_v1.json |
| Queries | 15 |
| Profiles | baseline, expanded-budget, query-aware |

## Profile Summary

| Profile | Query Options |
|---|---|
| baseline | `{}` |
| expanded-budget | `{"mode":"mix","topK":12,"chunkTopK":20,"maxEntityTokens":4000,"maxRelationTokens":4000,"maxTotalTokens":12000,"enableRerank":true,"includeReferences":true,"includeChunkContent":true}` |
| query-aware | `{}` |

## Evaluation Status

| Profile | Active Queries | Skipped Queries | Dominant Skip Reasons |
|---|---|---|---|
| baseline | 15/15 | 0/15 | none |
| expanded-budget | 15/15 | 0/15 | none |
| query-aware | 15/15 | 0/15 | none |

## Metrics Comparison

| Profile | Grounded | Multi-hop | Temporal | Provenance | Flat KW | Graph KW | Graph Wins | Flat Wins |
|---|---|---|---|---|---|---|---|---|
| baseline | 100.00% | 100.00% | 87.50% | 100.00% | 91.11% | 14.44% | 0 | 13 |
| expanded-budget | 100.00% | 100.00% | 87.50% | 100.00% | 91.11% | 14.44% | 0 | 13 |
| query-aware | 100.00% | 100.00% | 87.50% | 100.00% | 91.11% | 19.44% | 0 | 12 |

## Diagnostic Comparison

| Profile | Avg Up Ent | Avg Up Rel | Gold Returned | Exact Support | Rerank Miss | Upstream Miss | Abstraction Gap | Seed Coverage | Structured Coverage | Graph-Use Coverage | Structured Prov Success | Pseudo Top Rate |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| baseline | 15.53 | 18.60 | n/a | n/a | n/a | n/a | n/a | 100.00% | 100.00% | 100.00% | 100.00% | 0.00% |
| expanded-budget | 22.60 | 27.53 | n/a | n/a | n/a | n/a | n/a | 100.00% | 100.00% | 100.00% | 100.00% | 0.00% |
| query-aware | 16.53 | 18.27 | n/a | n/a | n/a | n/a | n/a | 100.00% | 100.00% | 86.67% | 100.00% | 0.00% |

## Delta Vs Baseline

| Profile | Grounded Δ | Multi-hop Δ | Temporal Δ | Provenance Δ | Seed Δ | Struct Prov Δ |
|---|---|---|---|---|---|---|
| expanded-budget | 0.00% | 0.00% | 0.00% | 0.00% | 0.00% | 0.00% |
| query-aware | 0.00% | 0.00% | 0.00% | 0.00% | 0.00% | 0.00% |

## Profile: baseline

| Metric | Value | Target |
|---|---|---|
| Graph Grounded Recall Rate | 100.00% | >= 80% |
| Multi-hop Memory Accuracy | 100.00% | >= flat + 10pp |
| Temporal Consistency Accuracy | 87.50% | >= 75% |
| Correction Accuracy | 0.00% | diagnostic |
| Anchor Hit Rate | 100.00% | diagnostic |
| Provenance Completeness | 100.00% | diagnostic |
| Query-memory Reuse Rate | 0.00% | diagnostic |
| Insight Reuse Rate | 0.00% | diagnostic |
| Seed Coverage Rate | 100.00% | diagnostic |
| Structured Anchor Coverage | 100.00% | diagnostic |
| Graph Support Usage Rate | 100.00% | diagnostic |
| Structured Provenance Success | 100.00% | diagnostic |
| Pseudo Top Anchor Rate | 0.00% | diagnostic |
| Gold-anchor labeled queries | 0 | diagnostic |
| Gold Returned In Filtered Chunks | n/a | diagnostic |
| Exact Support Visible In Returned Chunks | n/a | diagnostic |
| Returned But Reranked Wrong | n/a | diagnostic |
| Upstream Miss | n/a | diagnostic |
| Grounded But Abstraction Gap Likely | n/a | diagnostic |
| Seeded insight records | 8 | diagnostic |

| Query | Grounded | Chunks | Up Ent | Up Rel | Gold Returned | Exact Support | Recovery Bucket | Seeded | Struct | GraphUse | Prov | TopKind | Ent | Rel | Winner |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| RQ-001 | Y | 8 | 14 | 20 | N | N | no_gold_anchor | 5 | 5 | 5 | 5 | structured | 16 | 16 | FLAT |
| RQ-002 | Y | 8 | 11 | 15 | N | N | no_gold_anchor | 5 | 5 | 5 | 5 | structured | 30 | 37 | FLAT |
| RQ-003 | Y | 8 | 16 | 18 | N | N | no_gold_anchor | 5 | 5 | 5 | 5 | structured | 23 | 23 | SAME |
| RQ-004 | Y | 8 | 16 | 24 | N | N | no_gold_anchor | 5 | 5 | 5 | 5 | structured | 34 | 36 | FLAT |
| RQ-005 | Y | 8 | 11 | 24 | N | N | no_gold_anchor | 5 | 5 | 5 | 5 | structured | 31 | 35 | SAME |
| RQ-006 | Y | 8 | 16 | 16 | N | N | no_gold_anchor | 5 | 5 | 5 | 5 | structured | 20 | 20 | FLAT |
| RQ-007 | Y | 8 | 14 | 19 | N | N | no_gold_anchor | 5 | 5 | 5 | 5 | structured | 27 | 31 | FLAT |
| RQ-008 | Y | 8 | 19 | 22 | N | N | no_gold_anchor | 5 | 5 | 5 | 5 | structured | 33 | 34 | FLAT |
| RQ-009 | Y | 8 | 19 | 14 | N | N | no_gold_anchor | 5 | 5 | 5 | 5 | structured | 18 | 18 | FLAT |
| RQ-010 | Y | 8 | 18 | 19 | N | N | no_gold_anchor | 5 | 5 | 5 | 5 | structured | 8 | 8 | FLAT |
| RQ-011 | Y | 8 | 14 | 17 | N | N | no_gold_anchor | 5 | 5 | 2 | 5 | structured | 5 | 6 | FLAT |
| RQ-012 | Y | 8 | 19 | 18 | N | N | no_gold_anchor | 5 | 5 | 5 | 5 | structured | 28 | 30 | FLAT |
| RQ-013 | Y | 8 | 14 | 18 | N | N | no_gold_anchor | 5 | 5 | 5 | 5 | structured | 29 | 30 | FLAT |
| RQ-014 | Y | 8 | 16 | 14 | N | N | no_gold_anchor | 5 | 5 | 5 | 5 | structured | 14 | 15 | FLAT |
| RQ-015 | Y | 8 | 16 | 21 | N | N | no_gold_anchor | 5 | 5 | 5 | 5 | structured | 23 | 25 | FLAT |

## Profile: expanded-budget

| Metric | Value | Target |
|---|---|---|
| Graph Grounded Recall Rate | 100.00% | >= 80% |
| Multi-hop Memory Accuracy | 100.00% | >= flat + 10pp |
| Temporal Consistency Accuracy | 87.50% | >= 75% |
| Correction Accuracy | 0.00% | diagnostic |
| Anchor Hit Rate | 100.00% | diagnostic |
| Provenance Completeness | 100.00% | diagnostic |
| Query-memory Reuse Rate | 0.00% | diagnostic |
| Insight Reuse Rate | 0.00% | diagnostic |
| Seed Coverage Rate | 100.00% | diagnostic |
| Structured Anchor Coverage | 100.00% | diagnostic |
| Graph Support Usage Rate | 100.00% | diagnostic |
| Structured Provenance Success | 100.00% | diagnostic |
| Pseudo Top Anchor Rate | 0.00% | diagnostic |
| Gold-anchor labeled queries | 0 | diagnostic |
| Gold Returned In Filtered Chunks | n/a | diagnostic |
| Exact Support Visible In Returned Chunks | n/a | diagnostic |
| Returned But Reranked Wrong | n/a | diagnostic |
| Upstream Miss | n/a | diagnostic |
| Grounded But Abstraction Gap Likely | n/a | diagnostic |
| Seeded insight records | 8 | diagnostic |

| Query | Grounded | Chunks | Up Ent | Up Rel | Gold Returned | Exact Support | Recovery Bucket | Seeded | Struct | GraphUse | Prov | TopKind | Ent | Rel | Winner |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| RQ-001 | Y | 8 | 19 | 28 | N | N | no_gold_anchor | 5 | 5 | 5 | 5 | structured | 24 | 24 | FLAT |
| RQ-002 | Y | 8 | 22 | 26 | N | N | no_gold_anchor | 5 | 5 | 5 | 5 | structured | 31 | 37 | FLAT |
| RQ-003 | Y | 8 | 24 | 29 | N | N | no_gold_anchor | 5 | 5 | 5 | 5 | structured | 23 | 23 | SAME |
| RQ-004 | Y | 8 | 22 | 33 | N | N | no_gold_anchor | 5 | 5 | 5 | 5 | structured | 40 | 45 | FLAT |
| RQ-005 | Y | 8 | 18 | 32 | N | N | no_gold_anchor | 5 | 5 | 5 | 5 | structured | 39 | 39 | SAME |
| RQ-006 | Y | 8 | 19 | 26 | N | N | no_gold_anchor | 5 | 5 | 5 | 5 | structured | 19 | 19 | FLAT |
| RQ-007 | Y | 8 | 21 | 31 | N | N | no_gold_anchor | 5 | 5 | 5 | 5 | structured | 30 | 34 | FLAT |
| RQ-008 | Y | 8 | 29 | 31 | N | N | no_gold_anchor | 5 | 5 | 5 | 5 | structured | 36 | 37 | FLAT |
| RQ-009 | Y | 8 | 24 | 19 | N | N | no_gold_anchor | 5 | 5 | 5 | 5 | structured | 19 | 19 | FLAT |
| RQ-010 | Y | 8 | 28 | 30 | N | N | no_gold_anchor | 5 | 5 | 5 | 5 | structured | 23 | 23 | FLAT |
| RQ-011 | Y | 8 | 22 | 23 | N | N | no_gold_anchor | 5 | 5 | 4 | 5 | structured | 9 | 11 | FLAT |
| RQ-012 | Y | 8 | 25 | 26 | N | N | no_gold_anchor | 5 | 5 | 5 | 5 | structured | 25 | 27 | FLAT |
| RQ-013 | Y | 8 | 20 | 26 | N | N | no_gold_anchor | 5 | 5 | 5 | 5 | structured | 26 | 27 | FLAT |
| RQ-014 | Y | 8 | 24 | 22 | N | N | no_gold_anchor | 5 | 5 | 5 | 5 | structured | 16 | 17 | FLAT |
| RQ-015 | Y | 8 | 22 | 31 | N | N | no_gold_anchor | 5 | 5 | 5 | 5 | structured | 32 | 34 | FLAT |

## Profile: query-aware

| Metric | Value | Target |
|---|---|---|
| Graph Grounded Recall Rate | 100.00% | >= 80% |
| Multi-hop Memory Accuracy | 100.00% | >= flat + 10pp |
| Temporal Consistency Accuracy | 87.50% | >= 75% |
| Correction Accuracy | 0.00% | diagnostic |
| Anchor Hit Rate | 100.00% | diagnostic |
| Provenance Completeness | 100.00% | diagnostic |
| Query-memory Reuse Rate | 0.00% | diagnostic |
| Insight Reuse Rate | 0.00% | diagnostic |
| Seed Coverage Rate | 100.00% | diagnostic |
| Structured Anchor Coverage | 100.00% | diagnostic |
| Graph Support Usage Rate | 86.67% | diagnostic |
| Structured Provenance Success | 100.00% | diagnostic |
| Pseudo Top Anchor Rate | 0.00% | diagnostic |
| Gold-anchor labeled queries | 0 | diagnostic |
| Gold Returned In Filtered Chunks | n/a | diagnostic |
| Exact Support Visible In Returned Chunks | n/a | diagnostic |
| Returned But Reranked Wrong | n/a | diagnostic |
| Upstream Miss | n/a | diagnostic |
| Grounded But Abstraction Gap Likely | n/a | diagnostic |
| Seeded insight records | 8 | diagnostic |

| Query | Grounded | Chunks | Up Ent | Up Rel | Gold Returned | Exact Support | Recovery Bucket | Seeded | Struct | GraphUse | Prov | TopKind | Ent | Rel | Winner |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| RQ-001 | Y | 8 | 17 | 12 | N | N | no_gold_anchor | 5 | 5 | 5 | 5 | structured | 35 | 43 | FLAT |
| RQ-002 | Y | 8 | 11 | 8 | N | N | no_gold_anchor | 5 | 5 | 5 | 5 | structured | 26 | 33 | FLAT |
| RQ-003 | Y | 7 | 8 | 12 | N | N | no_gold_anchor | 5 | 5 | 0 | 5 | structured | 1 | 1 | SAME |
| RQ-004 | Y | 8 | 18 | 20 | N | N | no_gold_anchor | 5 | 5 | 5 | 5 | structured | 33 | 36 | FLAT |
| RQ-005 | Y | 7 | 8 | 13 | N | N | no_gold_anchor | 5 | 5 | 1 | 5 | structured | 1 | 1 | SAME |
| RQ-006 | Y | 8 | 21 | 30 | N | N | no_gold_anchor | 5 | 5 | 4 | 5 | structured | 16 | 16 | FLAT |
| RQ-007 | Y | 8 | 25 | 29 | N | N | no_gold_anchor | 5 | 5 | 5 | 5 | structured | 23 | 27 | FLAT |
| RQ-008 | Y | 8 | 12 | 9 | N | N | no_gold_anchor | 5 | 5 | 5 | 5 | structured | 37 | 40 | FLAT |
| RQ-009 | Y | 8 | 25 | 19 | N | N | no_gold_anchor | 5 | 5 | 5 | 5 | structured | 18 | 18 | FLAT |
| RQ-010 | Y | 8 | 20 | 20 | N | N | no_gold_anchor | 5 | 5 | 5 | 5 | structured | 25 | 29 | FLAT |
| RQ-011 | Y | 8 | 20 | 24 | N | N | no_gold_anchor | 5 | 5 | 5 | 5 | structured | 7 | 10 | FLAT |
| RQ-012 | Y | 8 | 20 | 24 | N | N | no_gold_anchor | 5 | 5 | 5 | 5 | structured | 38 | 40 | FLAT |
| RQ-013 | Y | 5 | 8 | 12 | N | N | no_gold_anchor | 5 | 5 | 5 | 5 | structured | 9 | 9 | FLAT |
| RQ-014 | Y | 8 | 27 | 28 | N | N | no_gold_anchor | 5 | 5 | 5 | 5 | structured | 15 | 16 | FLAT |
| RQ-015 | Y | 7 | 8 | 14 | N | N | no_gold_anchor | 3 | 5 | 0 | 5 | structured | 0 | 0 | SAME |


## Contrast Decision

- expanded-budget: grounded 100.00% (0.00% vs baseline), multi-hop 100.00% (0.00%), seed coverage 100.00% (0.00%), structured provenance 100.00% (0.00%).
- query-aware: grounded 100.00% (0.00% vs baseline), multi-hop 100.00% (0.00%), seed coverage 100.00% (0.00%), structured provenance 100.00% (0.00%).

---
*Recall eval runner v2026-04-02 · contrast package with documented LightRAG query knobs*