# T5 Replay Comparison Report (T4 vs T5)

Date: 2026-03-26  
Scope: intent replay evaluation for query intent routing (WHY/WHEN/ENTITY/GENERAL)

## What changed

1. Expanded replay dataset from **44** to **120** samples.
2. Increased GENERAL coverage to stress ambiguity handling:
   - WHY: 24
   - WHEN: 24
   - ENTITY: 24
   - GENERAL: 48
3. Updated eval runner to produce side-by-side **T4 baseline vs T5 current** metrics in one run, including:
   - overall accuracy
   - per-intent precision/recall/support
   - confusion matrix
   - case-level recovered/regressed diffs

Primary artifacts:
- `eval/intent_replay_dataset_2026-03-26.json`
- `eval/run-intent-replay-eval.mjs`
- `eval/intent_replay_results_2026-03-26.md`

## Evaluation command

```bash
npm run eval:intent-replay
```

## Final metrics (120 samples)

| Version | Correct | Accuracy | WHY Recall | WHEN Recall | ENTITY Recall | GENERAL Recall |
|---|---:|---:|---:|---:|---:|---:|
| T4 baseline | 98 | 81.67% | 87.50% | 100.00% | 95.83% | 62.50% |
| T5 current | 96 | 80.00% | 87.50% | 95.83% | 95.83% | 60.42% |
| Delta (T5-T4) | -2 | -1.67pp | 0.00pp | -4.17pp | 0.00pp | -2.08pp |

## Key confusion shifts

Off-diagonal deltas (T5 - T4):

- `WHEN -> GENERAL`: **+1**
- `GENERAL -> ENTITY`: **+1**

No off-diagonal bucket improved on this expanded dataset in aggregate.

## Case-level error shifts

- Recovered mistakes (T4 wrong -> T5 correct): **0**
- New regressions (T4 correct -> T5 wrong): **2**

New regressions:
1. `Q037` GENERAL -> ENTITY  
   Query: `列出最值得关注的三条进展`
2. `Q060` WHEN -> GENERAL  
   Query: `at what time did p95 latency peak`

## Interpretation

- On the larger and more GENERAL-heavy replay set, current T5 classifier behavior is **slightly below** T4 by overall accuracy.
- Dominant persistent error remains GENERAL disambiguation, especially collisions with temporal/entity lexical cues.
- The larger dataset is useful: it surfaced two regressions not visible in the 44-sample run.

## Risks / data bias notes

1. **Synthetic phrasing bias**: many samples are template-like and engineering-domain specific.
2. **Class prior bias**: GENERAL is intentionally overrepresented (40%) to pressure-test ambiguity; this may understate production recall for other intents.
3. **Language-mix bias**: dataset is zh/en bilingual but still skewed toward command-style prompts vs casual conversational forms.
4. **Single-label simplification**: some prompts are naturally multi-intent (e.g., summary + time), but eval enforces one label.

## Next recommendations

1. Add disambiguation for summary verbs (`summarize/总结/概述`) before weak temporal nouns (`recent/最近/time`) unless explicit temporal interrogatives (`when/什么时候/几点`) are present.
2. Add a small adversarial slice focused on:
   - GENERAL+temporal words
   - GENERAL+entity words (e.g., "list key progress")
3. Track macro-F1 in addition to accuracy to reduce class-prior sensitivity.

---

Reference detailed report: `eval/intent_replay_results_2026-03-26.md`
