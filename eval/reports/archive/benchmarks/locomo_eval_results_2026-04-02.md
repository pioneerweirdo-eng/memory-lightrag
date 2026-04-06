# LoCoMo Evaluation Report — 2026-04-02T09:35:38.081Z

## Configuration

| Parameter | Value |
|---|---|
| Dataset | C:\Users\24787\.openclaw\workspace\agents\director\projects\memory-engine-plugin\memory-lightrag\eval\datasets\locomo10.json |
| Sample limit | 1 |
| QA limit per sample | 10 |
| Workspace prefix | bench_locomo_v2 |
| Profiles | baseline |
| Seed success | 419/419 |

## Replay Stats

| Metric | Value |
|---|---|
| Samples | 1 |
| Writes | 419 |
| Queries | 10 |

## Profile Summary

| Profile | Grounded | Multi-hop | Temporal | Prov | Evidence Hit | Ans Exact | Ans Contains | Ans Token Recall |
|---|---|---|---|---|---|---|---|---|
| baseline | 100.00% | 100.00% | 0.00% | 100.00% | 80.00% | 0.00% | 10.00% | 26.67% |

## Profile: baseline

| Metric | Value |
|---|---|
| Graph Grounded Recall Rate | 100.00% |
| Multi-hop Memory Accuracy | 100.00% |
| Temporal Consistency Accuracy | 0.00% |
| Provenance Completeness | 100.00% |
| Anchor Hit Rate | 100.00% |
| Evidence Anchor Hit Rate | 80.00% |
| Answer Exact Rate | 0.00% |
| Answer Containment Rate | 10.00% |
| Answer Token Recall | 26.67% |

| Query | Grounded | Evidence Hit | Answer Contains | Anchors | Ent | Rel |
|---|---|---|---|---|---|---|
| LOCOMO-conv_26-001 | Y | Y | N | 5 | 30 | 82 |
| LOCOMO-conv_26-002 | Y | N | N | 5 | 40 | 75 |
| LOCOMO-conv_26-003 | Y | Y | N | 5 | 24 | 49 |
| LOCOMO-conv_26-004 | Y | Y | Y | 5 | 16 | 48 |
| LOCOMO-conv_26-005 | Y | Y | N | 5 | 16 | 74 |
| LOCOMO-conv_26-006 | Y | Y | N | 5 | 30 | 64 |
| LOCOMO-conv_26-007 | Y | Y | N | 5 | 33 | 43 |
| LOCOMO-conv_26-008 | Y | N | N | 5 | 24 | 61 |
| LOCOMO-conv_26-009 | Y | Y | N | 5 | 25 | 54 |
| LOCOMO-conv_26-010 | Y | Y | N | 5 | 32 | 89 |

---
*LoCoMo eval runner v2026-04-02 · replay through memory_write + graph-native recall*