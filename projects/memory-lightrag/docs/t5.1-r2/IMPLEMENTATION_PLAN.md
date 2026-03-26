# T5.1-R2 Implementation Plan

## v1 (repair)

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

## v2 (stabilization)

### Tasks
1. Add lightweight threshold profile support (strict/default/recall)
2. Add regression snapshots for top confusion edges:
   - GENERAL->WHEN
   - GENERAL->ENTITY
   - WHEN->GENERAL
3. Add docs section for threshold tuning playbook

### Acceptance
- Confusion edge counts drop vs v1 baseline
- No regressions in WHY/ENTITY recall >2pp

## v3 (production hardening)

### Tasks
1. Add feature flag for scored router rollout
2. Add runtime telemetry counters for intent distribution + low-margin rate
3. Define rollback command path in runbook

### Acceptance
- Safe canary rollout checklist complete
- Rollback validated in staging

## Risks and mitigation

- Risk: overfit on synthetic replay
  - Mitigation: include real sampled queries when available and separate holdout
- Risk: thresholds unstable across domains
  - Mitigation: profile presets + domain-level telemetry
- Risk: complexity creep
  - Mitigation: keep only one scorer table and one decision function

## Immediate next action
Proceed with v1 coding only after this research package is approved.
