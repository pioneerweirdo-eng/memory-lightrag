# Validation Roundup - 2026-04-06

This note consolidates the 2026-04-06 experiment-first validation work for recall routing, EvidenceGroup ranking, and confidence calibration.

## Scope

- Query mixed-demand prevalence
- EvidenceGroup shadow reranking headroom
- Answerability / confidence calibration
- Deterministic vs `python_stdio` intent-provider comparison

## Artifacts

- `eval/reports/query_mixed_demand_audit_2026-04-06.md`
- `eval/reports/mixed_demand_prevalence_2026-04-06.md`
- `eval/reports/evidence_group_shadow_ranking_2026-04-06.md`
- `eval/reports/answer_calibration_audit_2026-04-06.md`
- `eval/reports/answer_calibration_audit_2026-04-06_deterministic.md`

## Main Findings

### 1. Mixed-demand is real

- `query_mixed_demand_audit`:
  - recall queries with `2+` active axes: `11/15` (`73.33%`)
  - recall queries with `3` active axes: `3/15` (`20.00%`)
  - `temporal + multi-hop` cases collapsed to a single primary route: `6`
- `mixed_demand_prevalence`:
  - intent mixed-boundary rows: `15/224` (`6.70%`)
  - recall `multi-hop + temporal`: `8/15` (`53.33%`)
  - recall `multi-hop + correction`: `6/15` (`40.00%`)

Reading:

- Mixed-demand behavior is common in recall tasks.
- The prevalence signal is much stronger in recall than in single-label intent replay.
- This supports more offline validation work, but does not yet justify a serving-path rewrite by itself.

### 2. Learned EvidenceGroup reranking has no visible headroom on the current bank

- `evidence_group_shadow_ranking` cases: `25`
- visible gold-group cases: `25`
- competitive cases: `24`
- baseline heuristic:
  - visible `Hit@1 = 100%`
  - competitive `Hit@1 = 100%`
  - `MRR = 1.0000`
- shadow logistic group ranker:
  - visible `Hit@1 = 100%`
  - competitive `Hit@1 = 100%`
  - `MRR = 1.0000`

Reading:

- Current visible bank shows no ranking gain from a learned group scorer.
- On this evidence, a runtime group-ranker replacement is not justified yet.

### 3. Calibration and abstention are the stronger problem

From `answer_calibration_audit` on the current 13-case bank:

- correctness: `61.54%`
- expected answerable rate: `76.92%`
- predicted answerable rate: `92.31%`
- answerability agreement: `84.62%`

Deterministic report:

- top-group vs correctness:
  - `ECE = 0.1979`
  - `Brier = 0.2786`
- top-group vs expected answerability:
  - `ECE = 0.3027`
  - `Brier = 0.2192`
  - best threshold from sweep: `0.40`
  - threshold-sweep accuracy: `92.31%`
  - threshold-sweep F1: `0.9524`

Provider-backed report (`answer_calibration_audit_2026-04-06.md`):

- top-group vs correctness:
  - `ECE = 0.2134`
  - `Brier = 0.2755`
- top-group vs expected answerability:
  - `ECE = 0.3672`
  - `Brier = 0.2161`
  - best threshold from sweep: `0.40`
  - threshold-sweep accuracy: `92.31%`
  - threshold-sweep F1: `0.9524`

Repeated high-confidence failures:

- `N3`: unsupported "lunar adoption agency" why-query still answered directly
- `N2`: unsupported "Mars colony" query still answered directly from unrelated history
- `P4A/P4B`: relationship-status answer still merges stale and current facts into `married; single`
- `P3A`: explicit-date case still returns a wrong temporal answer on this synthetic bank

Reading:

- The current score outputs are not reliable answerability probabilities.
- The main operational gap is over-answering and weak abstention/support gating.
- Calibration is currently a higher-value target than replacing the group ranker.
- On this bank, a simple `groupScore` threshold already looks more promising than the current implicit "answer unless obviously broken" behavior.

### 4. `python_stdio` intent handover is not the main limiter on this bank

Direct deterministic vs `python_stdio` comparison:

- correctness stayed `61.54%`
- answerability agreement stayed `84.62%`
- failure set stayed effectively the same
- only small score nudges appeared, especially on unsupported negatives

Reading:

- On this bank, local model routing does not fix the main failures.
- The bottleneck is downstream answerability judgment, not intent-provider selection.

## What This Means

Supported:

- keep mixed-demand as a real research target
- keep offline evaluation and shadow experiments running
- prioritize answerability calibration / abstention gating

Not supported yet:

- full control-vector serving rewrite
- runtime learned EvidenceGroup reranker replacement
- attributing current failures mainly to the intent model

## Recommended Next Experiment

The next highest-ROI experiment should be:

- a pure eval/shadow abstention-calibration probe on top-group answerability
- using current runtime features:
  - `groupScore`
  - provenance/support breadth
  - contradiction/supersession state
  - temporal fit / history fit
  - support audit outputs

Success criterion:

- reduce unsupported-negative acceptance without hurting current positive cases.
