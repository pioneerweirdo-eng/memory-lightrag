# T5.1-R2 Implementation Plan

> Updated 2026-03-27 to align implementation work with:
> - `docs/DIRECTOR_ROUTE_ALIGNMENT_AND_NEXT_STEPS_2026-03-27.md`
> - long-term MAMGA / ontology goals
>
> Key principle: **T5.1-R2 is a thin control layer for uncertainty-aware routing, not the final intelligence architecture.**

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

### Scope boundary for v2
v2 is allowed to add only a **small, bounded control-layer scorer**.
It must not turn into an open-ended feature zoo.

Allowed purpose:
- score vector
- confidence / margin logic
- ambiguity routing
- two high-value pairwise tie-breaks

Not allowed in v2:
- broad pairwise rule expansion
- large handcrafted feature catalogs
- treating query-surface features as final architecture

### Tasks
1. Add `src/policy/intent-features.ts`
   - keep the feature set intentionally small
   - include only stable, reviewable signals
2. Add `src/policy/intent-scorer.ts`
   - produce a score vector for `WHY / WHEN / ENTITY / GENERAL`
3. Refactor `src/policy/query-intent.ts` to scored routing
   - add `minScore` and `minMargin` logic
   - route low-confidence cases into safe handling instead of forced hard classification
4. Add **only two** pairwise tie-breaks:
   - `GENERAL vs WHEN`
   - `GENERAL vs ENTITY`
5. Extend eval runner to print score / margin distribution for errors
6. Add calibration set file (20-30 hard mixed-intent queries)
7. Add observability fields for runtime / eval output:
   - score vector
   - top1 / top2
   - margin
   - route mode (`direct`, `tiebreak`, `general_safe`, `ambiguous_safe`)

### Acceptance
- `npm run verify:intent-rerank` pass
- `npm run eval:intent-replay` pass
- Metrics:
  - GENERAL recall >= 70%
  - accuracy >= 80.67% (T4-1.0pp)
- Confusion reporting explicitly includes:
  - GENERAL↔WHEN
  - GENERAL↔ENTITY
- No unbounded feature growth introduced in this pass

## v3 (stabilization)

### Tasks
1. Add threshold profile support (strict/default/recall)
2. Add regression snapshots for top confusion edges:
   - GENERAL->WHEN
   - GENERAL->ENTITY
   - WHEN->GENERAL
3. Add docs section for threshold tuning playbook
4. Start introducing retrieval-aware evidence into routing support signals
   - temporal evidence concentration in recalled items
   - entity concentration / dominant entity evidence
   - broad / mixed evidence pattern

### Acceptance
- Confusion edge counts drop vs v2 baseline
- No regressions in WHY/ENTITY recall >2pp
- At least one retrieval-aware signal is incorporated into evaluation or routing diagnostics

## v4 (production hardening)

### Tasks
1. Add feature flag for scored router rollout
   - `intent.scoredRouting.enabled`
2. Add runtime telemetry counters for intent distribution + low-margin rate
3. Define rollback path in runbook
4. Add an architecture checkpoint section to verify no drift away from MAMGA / ontology goals
   - Is routing still query-only?
   - Is ontology participating more than before?
   - Has feature growth remained bounded?

### Acceptance
- Safe canary rollout checklist complete
- Rollback validated in staging
- Architecture checkpoint completed before production default-on rollout

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
- Risk: feature-engineering drift away from ontology goals
  - Mitigation: bound feature count, require retrieval-aware follow-up in v3, review architecture checkpoint before broader rollout
- Risk: GENERAL remains a hidden residue class
  - Mitigation: require positive GENERAL signals in scorer design and track GENERAL confusion pairs explicitly
