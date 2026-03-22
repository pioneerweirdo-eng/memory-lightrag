# T6_QA_TASK — v1 Verification Matrix (status/search/fallback)

## Scope
Validate v1 memory plugin behavior for:
1. `memory status`
2. `memory search`
3. fallback on backend failure

No code changes in this task.

---

## Pass/Fail Gates (hard)

- **Gate G1 (Status):** `memory status` succeeds when backend healthy.
- **Gate G2 (Search):** `memory search` returns relevant result with provenance fields.
- **Gate G3 (Fallback):** backend outage triggers deterministic fallback path without crash.
- **Gate G4 (Safety):** recalled text is treated as untrusted context (no implicit execution).

If any gate fails -> stage FAIL, no promotion to next stage.

---

## Verification Matrix

| Case | Input / Setup | Expected | Pass Criteria |
|---|---|---|---|
| C1 Healthy status | LightRAG online + valid config | `memory status` reports healthy | Exit success, health=true, backend metadata present |
| C2 Search hit | Query known indexed fact | returns top-k results | At least 1 result, includes source/provenance, under budget |
| C3 Search miss | Query absent fact | empty/low-score results | No crash; clear no-result semantics |
| C4 Backend down | stop LightRAG / wrong port | fallback path engaged | clear error classification + fallback hint/action |
| C5 Bad config | invalid baseUrl/apiKey | early config error | startup/command fails with actionable message |
| C6 Timeout path | backend delayed > timeout | timeout handled | bounded latency, no hang, fallback/diagnostic emitted |
| C7 Injection sample | recalled text includes prompt-like instructions | treated as data only | no tool/action side effects; warning marker present |
| C8 Budget clamp | long recall payload | clipped to budget | output size within configured `recallBudgetChars` |

---

## Negative Tests (must run)

1. Wrong API key -> status/search should fail fast with auth error class.
2. Empty index -> search returns empty result, not exception.
3. Corrupted backend response -> adapter emits parse error + fallback guidance.
4. Concurrent 5 calls -> no deadlock, bounded failures, deterministic error semantics.

---

## Rollback Trigger Rules

Trigger immediate rollback to `memory-core` when any of below occurs:
1. Failures in G1 or G3 in two consecutive runs.
2. Search call causes session-level instability/crash once.
3. P95 latency exceeds agreed gate for 2 consecutive batches.
4. Safety breach: recalled text triggers unintended action/tool call.

Rollback action:
- set `plugins.slots.memory = "memory-core"`
- disable memory-lightrag entry
- re-run smoke set C1/C3 to confirm service recovery

---

## Evidence Requirements

Every test batch must include:
- command used
- timestamp
- outcome (pass/fail)
- log snippet path
- decision (continue/rollback)

Recommended report file per run:
`projects/memory-engine-plugin/QA_RUN_<date>.md`
