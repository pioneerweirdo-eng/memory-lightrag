# T6_ARCHITECT_TASK — memory-lightrag Plugin Scaffold Spec (v1)

## 1) Target
Design a concrete scaffold for an OpenClaw **memory plugin** (`memory-lightrag`) with v1 scope:
- `memory status`
- `memory search`
- deterministic fallback contract

No implementation code in this deliverable.

---

## 2) Plugin Manifest Spec

File: `openclaw.plugin.json`

Required keys:
- `id`: `memory-lightrag`
- `name`: `memory-lightrag`
- `version`: semver
- `kind`: `memory`
- `entry`: `index.ts`
- `config`: schema object (see section 4)

Activation path:
- `plugins.entries.memory-lightrag.enabled = true`
- `plugins.slots.memory = "memory-lightrag"`

Fallback target (global):
- `plugins.slots.memory = "memory-core"` when rollback triggered

---

## 3) Module Boundaries

### A. `index` (Plugin bootstrap)
Responsibilities:
- register memory plugin capabilities (`status/search`)
- read + validate config
- wire adapter + safety/budget policies

Out-of-scope:
- no heavy business logic

### B. `config` (Validation + defaults)
Responsibilities:
- normalize config
- enforce required fields and bounds
- provide explicit error messages

### C. `adapter/lightrag` (IO adapter)
Responsibilities:
- map plugin search/status requests to LightRAG API
- map transport and response errors to typed plugin errors

### D. `policy/budget`
Responsibilities:
- enforce `recallTopK`, `minScore`, `recallBudgetChars`

### E. `policy/safety`
Responsibilities:
- mark recalled content as untrusted
- run basic injection pattern checks
- ensure no tool/action execution from recalled text

### F. `fallback`
Responsibilities:
- produce deterministic fallback response contract
- expose rollback hint (`switch slot to memory-core`)

---

## 4) Config Schema (v1)

```json5
{
  baseUrl: string,              // required, e.g. http://127.0.0.1:9621
  apiKey: string,               // optional
  timeoutMs: number = 6000,     // [1000, 30000]
  retryCount: number = 1,       // [0, 3]
  recallTopK: number = 6,       // [1, 20]
  minScore: number = 0.55,      // [0, 1]
  recallBudgetChars: number = 1800, // [200, 8000]
  includeCitations: boolean = true,
  enableSafetyFilter: boolean = true
}
```

Validation failures are **hard errors** with actionable messages.

---

## 5) Search Contract (v1)

Input:
- query (required)
- optional overrides: topK, minScore

Output:
- `items[]` each with:
  - `content`
  - `score`
  - `source` (id/url/path)
  - `provenance` (backend + timestamp)
- `meta`:
  - `truncated` (budget clamp)
  - `topKApplied`
  - `latencyMs`

Behavior:
- empty result is valid (not exception)
- malformed backend response => typed parse error

---

## 6) Status Contract (v1)

Output:
- `healthy: boolean`
- `backend: "lightrag"`
- `baseUrl`
- `latencyMs` (probe)
- `diagnostics[]` (warnings/errors)

Status must differentiate:
- connectivity error
- auth error
- timeout
- config error

---

## 7) Fallback Contract (v1)

Trigger:
- backend unavailable / auth failed / timeout threshold exceeded

Return shape:
- `fallback: true`
- `reason`: typed enum (`BACKEND_DOWN`, `AUTH_FAILED`, `TIMEOUT`, `BAD_CONFIG`, `PARSE_ERROR`)
- `actionHint`: exact next action (e.g., switch slot to memory-core)

Rollback policy tie-in:
- If G1/G3 fail two consecutive batches -> set `plugins.slots.memory = "memory-core"`

---

## 8) Non-goals (v1)

- auto-capture
- consolidation/decay
- advanced rerank/graph pipelines
- asynchronous background memory writes

---

## 9) Acceptance Checklist

- [ ] Manifest is valid and loadable
- [ ] Config validation catches bad values early
- [ ] `memory status` returns typed health states
- [ ] `memory search` returns bounded, sourced results
- [ ] fallback is deterministic and actionable
- [ ] safety policy ensures recalled text is non-executable context
