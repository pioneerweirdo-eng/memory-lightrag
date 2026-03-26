# T5.1-R2 Architecture

## 1) Design goal
Recover GENERAL recall without sacrificing overall quality by replacing brittle hard-priority-only decisions with deterministic scored routing.

## 2) Core components

1. `intent-features.ts` (new)
   - Extract feature hits:
     - `causalStrong`, `temporalStrong`, `temporalWeak`, `entityStrong`, `entityWeak`, `generalWeak`, `eventAnchor`, `entityAnchor`.

2. `intent-scorer.ts` (new)
   - Convert features to numeric scores:
     - `scoreWHY`, `scoreWHEN`, `scoreENTITY`, `scoreGENERAL`.
   - Adjustable weights in one table for calibration.

3. `query-intent.ts` (refactor)
   - Keep current export: `detectQueryIntent(query): QueryIntent`.
   - Internally call scorer + threshold policy.

4. Optional diagnostics (non-breaking)
   - `detectQueryIntentDetailed(query)` for eval-only use (scores + margin).

## 3) Decision policy

1. Hard short-circuit (high precision):
   - Clear causal patterns => WHY
   - Clear temporal patterns + event anchors => WHEN
   - Clear entity patterns + entity anchors => ENTITY

2. Otherwise scored arbitration:
   - Compute all scores
   - `topIntent = argmax(scores)`
   - `margin = top - second`
   - If `top < minScore` or `margin < minMargin`, return GENERAL

## 4) Why this aligns with research

- Mirrors MAMGA style of "classify/rout then adapt weights" rather than single regex class dominance.
- Keeps deterministic behavior and low latency.
- Adds calibration knobs to avoid repeated regex whack-a-mole.

## 5) Compatibility

- Public label set unchanged.
- Existing `details.ontologyPolicy.intent` remains compatible.
- Optional internal diagnostics used by eval only.
