# T5.1-R2 Implementation Plan

## Current state (2026-03-26)

- Runtime intent routing is still rule-based (`src/policy/query-intent.ts`).
- Scored routing (`minScore` / `minMargin`) is a planned path and **not active yet**.
- `details.ontologyPolicy` currently contains only implemented fields:
  - `intent`
  - `rerankWeights`

## v1 (repair, completed in this pass)

### Tasks
1. Expand `test/intent-rerank.verify.mjs` boundary coverage for scored-routing edges and GENERAL protection.
2. Add docs notes clarifying implemented behavior vs planned thresholds/flags.
3. Align field names to runtime output (`details.ontologyPolicy.intent`, `details.ontologyPolicy.rerankWeights`).

### Acceptance
- `npm run verify:intent-rerank` pass

## v2 (scored-router implementation, planned)

### Tasks
1. Add `src/policy/intent-features.ts`
2. Add `src/policy/intent-scorer.ts`
3. Refactor `src/policy/query-intent.ts` to scored routing
4. Extend eval runner to print score/margin distribution for errors
5. Add calibration set file (20-30 hard mixed-intent queries)

### Acceptance
- `npm run verify:intent-rerank` pass
- `npm run eval:intent-replay` pass
- Metrics:
  - GENERAL recall >= 70%
  - accuracy >= 80.67% (T4-1.0pp)

## v3 (stabilization)

### Tasks
1. Add threshold profile support (strict/default/recall)
2. Add regression snapshots for top confusion edges:
   - GENERAL->WHEN
   - GENERAL->ENTITY
   - WHEN->GENERAL
3. Add docs section for threshold tuning playbook

### Acceptance
- Confusion edge counts drop vs v2 baseline
- No regressions in WHY/ENTITY recall >2pp

## v4 (production hardening)

### Tasks
1. Add feature flag for scored router rollout
   - `intent.scoredRouting.enabled`
2. Add runtime telemetry counters for intent distribution + low-margin rate
3. Define rollback path in runbook

### Acceptance
- Safe canary rollout checklist complete
- Rollback validated in staging

## Rollback knobs (planned)

- Disable scored routing: `intent.scoredRouting.enabled=false`
- Tune thresholds:
  - `intent.scoredRouting.minScore`
  - `intent.scoredRouting.minMargin`

> These keys are documented as rollout intent; they are not consumed by runtime code yet.

## Risks and mitigation

- Risk: overfit on synthetic replay
  - Mitigation: include real sampled queries when available and separate holdout
- Risk: thresholds unstable across domains
  - Mitigation: profile presets + domain-level telemetry
- Risk: complexity creep
  - Mitigation: keep one scorer table and one decision function
