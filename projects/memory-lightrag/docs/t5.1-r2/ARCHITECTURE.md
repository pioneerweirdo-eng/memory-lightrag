# T5.1-R2 Architecture

## 1) Design goal
Recover GENERAL recall without sacrificing overall quality by evolving brittle hard-priority-only decisions toward deterministic scored routing.

> Status note (2026-03-26): scored routing is an R2 target architecture, **not yet enabled in runtime**. Current production behavior remains regex/rule routing in `detectQueryIntent` with precedence `WHY -> WHEN -> ENTITY -> GENERAL`.

## 2) Core components (target)

1. `intent-features.ts` (planned)
   - Extract feature hits:
     - `causalStrong`, `temporalStrong`, `temporalWeak`, `entityStrong`, `entityWeak`, `generalWeak`, `eventAnchor`, `entityAnchor`.

2. `intent-scorer.ts` (planned)
   - Convert features to numeric scores:
     - `scoreWHY`, `scoreWHEN`, `scoreENTITY`, `scoreGENERAL`.
   - Adjustable weights in one table for calibration.

3. `query-intent.ts` (staged refactor)
   - Keep current export: `detectQueryIntent(query): QueryIntent`.
   - Later, internally call scorer + threshold policy once gated rollout starts.

4. Optional diagnostics (non-breaking, planned)
   - `detectQueryIntentDetailed(query)` for eval-only use (scores + margin).

## 3) Decision policy (target)

1. Hard short-circuit (high precision):
   - Clear causal patterns => WHY
   - Clear temporal patterns + event anchors => WHEN
   - Clear entity patterns + entity anchors => ENTITY

2. Otherwise scored arbitration:
   - Compute all scores
   - `topIntent = argmax(scores)`
   - `margin = top - second`
   - If `top < minScore` or `margin < minMargin`, return GENERAL

## 4) Rollout/rollback knobs (feature-flag note)

Planned knobs for canary + rollback:
- `intent.scoredRouting.enabled` (boolean feature flag, default `false` in first rollout)
- `intent.scoredRouting.minScore`
- `intent.scoredRouting.minMargin`

Rollback behavior (planned): flip `intent.scoredRouting.enabled=false` to revert to current rule detector.

## 5) Compatibility

- Public label set unchanged.
- Current emitted runtime field remains `details.ontologyPolicy.intent` + `details.ontologyPolicy.rerankWeights`.
- No runtime score/margin fields are emitted yet.
- Optional diagnostics are for eval only once implemented.

## 6) Why this aligns with research

- Mirrors MAMGA style of "classify/rout then adapt weights" rather than single regex class dominance.
- Keeps deterministic behavior and low latency.
- Adds calibration knobs to avoid repeated regex whack-a-mole.
