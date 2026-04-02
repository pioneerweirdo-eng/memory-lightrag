# Recall Evaluation Report — 2026-04-02T05:43:51.901Z

## Configuration

| Parameter | Value |
|---|---|
| LightRAG | http://127.0.0.1:9621 |
| Dataset | recall_labeled_v1.json |
| Queries | 15 |
| Skipped (both empty) | 0 |

## Aggregate Metrics

| Metric | Flat-Snippet | Graph-Native |
|---|---|---|
| Avg keyword hit rate | 12.22% | 4.44% |

| Metric | Value |
|---|---|
| Graph with entity expansion | 13.33% (2/15) |
| Graph with relation expansion | 6.67% (1/15) |
| Graph with anchors | 20.00% (3/15) |
| Both paths same score | 80.00% (12/15) |
| Graph wins (keyword) | 0.00% (0/15) |
| Flat wins (keyword) | 20.00% (3/15) |

## Per-Query Results

| Query | Expected Kind | Flat KW | Graph KW | Anchors | Ent | Rel | Winner |
|---|---|---|---|---|---|---|---|
| RQ-001 | episode | 66.67% | 66.67% | 4 | 5 | 0 | SAME |
| RQ-002 | preference | 0.00% | 0.00% | 0 | 0 | 0 | SAME |
| RQ-003 | decision | 0.00% | 0.00% | 0 | 0 | 0 | SAME |
| RQ-004 | episode | 0.00% | 0.00% | 0 | 0 | 0 | SAME |
| RQ-005 | preference | 33.33% | 0.00% | 4 | 0 | 0 | FLAT |
| RQ-006 | decision | 50.00% | 0.00% | 0 | 0 | 0 | FLAT |
| RQ-007 | episode | 0.00% | 0.00% | 0 | 0 | 0 | SAME |
| RQ-008 | episode | 0.00% | 0.00% | 0 | 0 | 0 | SAME |
| RQ-009 | preference | 0.00% | 0.00% | 0 | 0 | 0 | SAME |
| RQ-010 | decision | 0.00% | 0.00% | 0 | 0 | 0 | SAME |
| RQ-011 | episode | 33.33% | 0.00% | 0 | 0 | 0 | FLAT |
| RQ-012 | decision | 0.00% | 0.00% | 0 | 0 | 0 | SAME |
| RQ-013 | preference | 0.00% | 0.00% | 0 | 0 | 0 | SAME |
| RQ-014 | episode | 0.00% | 0.00% | 4 | 9 | 1 | SAME |
| RQ-015 | preference | 0.00% | 0.00% | 0 | 0 | 0 | SAME |

## Gate Decision

**⚠ Graph-native keyword recall < flat-snippet** — flat-snippet still outperforms on keyword coverage. Investigate entity linking or evidence assembly strategy.

---
*Recall eval runner v2026-04-02 · dataset recall_labeled_v1.json*