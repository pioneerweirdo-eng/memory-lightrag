# EvidenceGroup Shadow Experiment - 2026-04-06

Goal: validate whether EvidenceGroup-first learning and independent calibration are worth additional investment before any larger control-vector rewrite.

## Benchmark Composition

- Candidate groups: 49
- Queries: 18
- Families: identity_relationship (8 queries), memory_semantics (10 queries)

## Overall Ranking

| Method | Top-1 Accuracy | MRR | Brier | ECE |
|---|---:|---:|---:|---:|
| Current groupScore | 66.67% | 0.8056 | 0.2269 | 0.0669 |
| Shadow ranker | 66.67% | 0.8056 | 0.1731 | 0.1194 |
| Independent calibrator | n/a | n/a | 0.1861 | 0.1461 |

## Family Breakdown

| Family | Queries | Candidates | Baseline Acc | Shadow Acc | Baseline MRR | Shadow MRR | Baseline Brier | Calibrated Brier |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| identity_relationship | 8 | 29 | 37.50% | 25.00% | 0.6250 | 0.5625 | 0.2347 | 0.2466 |
| memory_semantics | 10 | 20 | 90.00% | 100.00% | 0.9500 | 1.0000 | 0.2157 | 0.0983 |

### Risk-Coverage: Current groupScore

| Coverage | Kept | Risk |
|---|---:|---:|
| 100% | 18 | 33.33% |
| 80% | 15 | 33.33% |
| 60% | 11 | 18.18% |

### Risk-Coverage: Shadow ranker

| Coverage | Kept | Risk |
|---|---:|---:|
| 100% | 18 | 33.33% |
| 80% | 15 | 33.33% |
| 60% | 11 | 18.18% |

### Risk-Coverage: Independent calibrator

| Coverage | Kept | Risk |
|---|---:|---:|
| 100% | 18 | 50.00% |
| 80% | 15 | 40.00% |
| 60% | 11 | 27.27% |

## Query Diagnostics

| Benchmark | Family | Baseline Correct | Shadow Correct | Baseline Conf | Shadow Conf | Calibrated Conf | Query |
|---|---|---|---|---:|---:|---:|---|
| MM-S1-q1 | memory_semantics | Y | Y | 0.584 | 0.970 | 0.976 | When did Caroline meet the counselor? |
| MM-S1-q2 | memory_semantics | Y | Y | 0.572 | 0.955 | 0.963 | What date did Caroline meet the counselor? |
| MM-S2-q1 | memory_semantics | N | Y | 0.445 | 0.998 | 0.803 | How does Caroline identify now? |
| MM-S2-q2 | memory_semantics | Y | Y | 0.544 | 0.992 | 0.833 | What identity does Caroline report now? |
| MM-S3-q1 | memory_semantics | Y | Y | 0.495 | 0.405 | 0.920 | What happened on 1998-07-02? |
| MM-S3-q2 | memory_semantics | Y | Y | 0.495 | 0.883 | 0.918 | What happened before everything else on 1998-07-02? |
| MM-S4-q1 | memory_semantics | Y | Y | 0.429 | 0.825 | 0.626 | What is Caroline's relationship status? |
| MM-S4-q2 | memory_semantics | Y | Y | 0.462 | 0.815 | 0.637 | What is Caroline's current relationship status? |
| MM-S5-q1 | memory_semantics | Y | Y | 0.497 | 0.968 | 0.921 | Why did Caroline choose the adoption agency? |
| MM-S5-q2 | memory_semantics | Y | Y | 0.497 | 0.967 | 0.924 | What made Caroline choose the adoption agency? |
| IR001 | identity_relationship | Y | N | 0.542 | 0.412 | 0.465 | What is Caroline's identity? |
| IR002 | identity_relationship | Y | N | 0.429 | 0.781 | 0.561 | How does Caroline describe her identity? |
| IR003 | identity_relationship | Y | Y | 0.528 | 0.586 | 0.476 | Caroline 现在是什么身份认同？ |
| IR004 | identity_relationship | N | N | 0.474 | 0.628 | 0.573 | What is Caroline's relationship status? |
| IR005 | identity_relationship | N | N | 0.542 | 0.476 | 0.466 | What is Caroline's relationship status now? |
| IR006 | identity_relationship | N | N | 0.542 | 0.672 | 0.306 | 她现在是什么关系状态？ |
| IR007 | identity_relationship | N | Y | 0.475 | 0.412 | 0.229 | 她现在觉得自己是个女生吗？ |
| IR008 | identity_relationship | N | N | 0.438 | 0.594 | 0.221 | 她现在感情上是什么情况？ |

## Reading

- Shadow ranking did not beat the current heuristic on this benchmark.
- Do not replace serving-path groupScore based on this evidence alone.
- Independent calibration reduced Brier from 0.2269 to 0.1861.
- This supports doing calibration work even if ranking work remains shadow-only.

---
*Leave-one-query-out evaluation. This is a shadow benchmark built from visible synthetic and structured fixtures, not a production-traffic replay.*