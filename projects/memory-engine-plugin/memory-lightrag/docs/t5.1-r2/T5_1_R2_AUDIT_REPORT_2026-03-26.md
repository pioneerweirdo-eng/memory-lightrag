# T5.1-R2 Anti-Fraud Audit Report

Date: 2026-03-26
Auditor: Orchestrator (independent rerun)

## 1) Audit controls executed

1. Independent rerun by orchestrator:
   - `npm run verify:intent-rerank`
   - `npm run eval:intent-replay`
   - `npx tsc -p tsconfig.json`
2. Fixed-file hash snapshot:
   - replay dataset
   - calibration dataset
   - eval runner
   - verify script
3. Code-report consistency check:
   - compared runtime JSON metrics vs markdown report outputs
4. Commit-chain inspection:
   - `67d3ef6`, `1a0e28b`, `64476aa` present in sequence

## 2) Independent rerun results (source of truth)

### verify
- PASS
- boundary cases: 19
- scored-routing boundary cases: 14

### replay eval (120)
- Baseline accuracy: 81.67%
- Current accuracy: 87.50%
- Delta: +5.83pp
- GENERAL recall: 62.50% -> 79.17% (+16.67pp)

### calibration eval (24)
- Baseline accuracy: 83.33%
- Current accuracy: 83.33% (no net gain)
- Note: gain appears in GENERAL recall, offset by WHEN recall drop.

## 3) Hashes (tamper-evidence)

- `eval/intent_replay_dataset_2026-03-26.json`
  - `cc76054dcf7dfeb6b1f1c477a2099509972801d4f28a059418ef4aa2b0d60db2`
- `eval/intent_calibration_dataset_2026-03-26.json`
  - `e0ec02522578fd39a7a9de638e9f85fc5a890d5d9a49f9c5301e12700191cc12`
- `eval/run-intent-replay-eval.mjs`
  - `f1dc21723dbd21c735ad00d487284d0ab866d369b813623b6fb4e2dbbd61918c`
- `test/intent-rerank.verify.mjs`
  - `9aeceffe89340c70154d24dda640b66bfbd156c32a2afbb3a2cd844efe8b499e`

## 4) Discrepancy findings

Subagent self-reported metrics and independent rerun are not identical:
- Subagent claim: replay accuracy 88.33%
- Independent rerun: replay accuracy 87.50%

Assessment:
- This does **not** indicate confirmed fraud by itself; likely due to commit-order/state drift between runs.
- Therefore, acceptance is based only on orchestrator rerun metrics above.

## 5) Gate decision (based on independent rerun only)

Target gates:
- GENERAL recall >= 70% ✅ (79.17%)
- accuracy >= T4-1.0pp (>=80.67%) ✅ (87.50%)

Additional caution gate:
- calibration improvement: not achieved (flat accuracy) ⚠️

Final decision: **Pass with caution**
- Allow progression to next phase under feature-flag/canary rollout.
- Do not claim universal improvement until larger holdout confirms calibration stability.

## 6) Required next safeguards

1. Lock eval command to explicit commit hash in report header.
2. Add CI job to auto-run replay+calibration and publish immutable artifact hash.
3. Add holdout set (>=50 real queries) as mandatory promotion gate.
