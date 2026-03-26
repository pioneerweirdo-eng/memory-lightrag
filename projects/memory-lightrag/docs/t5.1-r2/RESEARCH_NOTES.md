# T5.1-R2 Research Notes

Date: 2026-03-26
Scope: Intent routing repair for memory-lightrag (WHY/WHEN/ENTITY/GENERAL), research-first before coding.

## 1) Scope & constraints

- Objective: recover GENERAL recall while preserving overall accuracy and compatibility.
- Hard constraints:
  - Keep external API shape compatible (no breaking change to memory_search output fields).
  - Keep deterministic, low-latency rule path (no heavy model in hot path for now).
- Current baseline from replay eval (120 samples):
  - T4: accuracy 81.67%, GENERAL recall 62.50%
  - T5: accuracy 80.00%, GENERAL recall 60.42%
  - T5 regressed both metrics.

## 2) Evidence table

| Source | Claim | Confidence |
|---|---|---|
| `eval/intent_replay_results_2026-03-26.md` | T5 policy reduced accuracy by 1.67pp and GENERAL recall by 2.08pp vs T4 | High |
| `src/policy/query-intent.ts` (current) | Rule order is hard-priority and keyword-driven; weak cue suppression can over-correct | High |
| MAMGA `memory/query_engine.py` lines 225-245 | Naive `detect_query_intent` defaults non-matching queries to ENTITY, which is unsafe for GENERAL-heavy distributions | High |
| MAMGA `memory/query_engine.py` lines 247+ & 367+ | Practical system separates `intent/type` and applies adaptive params/weights later (not only one hard class) | High |
| MAMGA `memory/query_engine.py` lines 55-115 | RRF fusion treats multiple retrieval signals as additive, robust to single signal errors | High |

## 3) Option matrix (Adopt / Defer / Reject)

### Adopt
1. **Score-based intent routing (lightweight)**
   - Compute per-intent scores from feature groups (causal/temporal/entity/general).
   - Choose top intent only if confidence margin passes threshold; otherwise GENERAL.
2. **Two-stage disambiguation**
   - Stage A: strong cues short-circuit (e.g., clear WHY tokens).
   - Stage B: ambiguous cues require anchors and margin check.
3. **Calibration set gate**
   - Add hard mixed-intent calibration subset and require gate pass before full replay.

### Defer
1. LLM classifier for intent in hot path (cost/latency risk).
2. Multi-label intent output in runtime contract (needs broader downstream adaptation).

### Reject
1. More regex patches under strict hard-priority only.
   - Evidence: T5 already showed overfitting/metric regression.

## 4) Architecture decision (single path)

Decision: **Confidence-scored deterministic router** with compatibility-preserving output.

- Keep output labels unchanged (WHY/WHEN/ENTITY/GENERAL).
- Add internal scoring structure:
  - `scores: {why, when, entity, general}`
  - `topIntent`, `topScore`, `secondScore`, `margin`
- Selection policy:
  1) strong-cue short-circuit for WHY/WHEN/ENTITY;
  2) else compute scores and margin;
  3) if `topScore < minScore` or `margin < minMargin`, return GENERAL.

## 5) Risks / rollback / metrics

- Risks:
  1) Over-tuning to current 120-sample set;
  2) Margin thresholds too strict => too many GENERAL;
  3) Too loose => regress to false WHEN/ENTITY.
- Rollback (planned knobs):
  - Feature flag `intent.scoredRouting.enabled`; default false in first rollout.
  - Threshold knobs: `intent.scoredRouting.minScore`, `intent.scoredRouting.minMargin`.
  - Keep previous detector available as fallback strategy.
- Current implementation status:
  - Runtime currently uses rule precedence (`WHY -> WHEN -> ENTITY -> GENERAL`) in `detectQueryIntent`.
  - Runtime `details.ontologyPolicy` fields are currently `intent` and `rerankWeights` only.
- Metrics gates (T5.1-R2):
  - GENERAL recall >= 70%
  - Overall accuracy >= T4 - 1.0pp
  - WHEN recall >= 95%
  - ENTITY recall >= 95%

---

Conclusion: T5.1-R2 should shift from priority-regex patching to calibrated score routing before any further production promotion.
