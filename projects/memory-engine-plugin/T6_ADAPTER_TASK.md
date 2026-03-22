# T6_ADAPTER_TASK — LightRAG Minimal HTTP Adapter Contract (v1)

## Goal
Define the minimal adapter contract between `memory-lightrag` plugin and LightRAG backend for:
- `memory status`
- `memory search`

No implementation code.

---

## 1) Adapter Interface (conceptual)

### `checkHealth()`
- Purpose: backend availability + basic diagnostics
- Returns: `{ healthy, latencyMs, backendVersion?, diagnostics[] }`

### `search(query, options)`
- Purpose: retrieve relevant memory candidates
- Input:
  - `query: string`
  - `topK?: number`
  - `minScore?: number`
  - `timeoutMs?: number`
- Returns:
  - `items[]` (content, score, source, metadata)
  - `meta` (latency, truncated, requestId)

---

## 2) HTTP Mapping (v1)

> Endpoint names may vary across LightRAG deployment wrappers. The adapter contract standardizes behavior even when paths differ.

### Health Mapping
- Preferred probe order:
  1. `GET /health`
  2. fallback `GET /status`
  3. fallback lightweight query endpoint with noop payload

Success criteria:
- HTTP 2xx
- parseable JSON or known health text

### Search Mapping
- Preferred endpoint:
  - `POST /query` (or deployment-specific search route)
- Request body (normalized):
```json
{
  "query": "<text>",
  "top_k": 6,
  "min_score": 0.55
}
```
- Headers:
  - `Content-Type: application/json`
  - `Authorization: Bearer <apiKey>` when configured

---

## 3) Response Normalization

Regardless of backend payload shape, adapter must normalize to:

```json
{
  "items": [
    {
      "content": "...",
      "score": 0.78,
      "source": "doc_or_node_id",
      "metadata": {
        "title": "...",
        "url": "...",
        "chunk": "..."
      }
    }
  ],
  "meta": {
    "requestId": "optional",
    "latencyMs": 123,
    "truncated": false
  }
}
```

Rules:
- Missing score -> set `null`, then filtered by plugin policy layer
- Missing source -> set synthetic source `"lightrag:unknown"`
- Empty result -> valid `items: []`

---

## 4) Error Taxonomy (typed)

Adapter must emit stable error classes:
- `BAD_CONFIG` (invalid URL/key/params)
- `AUTH_FAILED` (401/403)
- `BACKEND_DOWN` (connection refused/DNS)
- `TIMEOUT` (request timeout)
- `RATE_LIMITED` (429)
- `PARSE_ERROR` (invalid payload)
- `UPSTREAM_5XX` (500/502/503/504)

Each error should include:
- `type`
- `message`
- `httpStatus?`
- `retryable: boolean`
- `actionHint`

---

## 5) Timeout / Retry Policy (v1 minimal)

Defaults:
- `timeoutMs = 6000`
- `retryCount = 1`
- `retryBackoffMs = 300` (single linear retry)

Retry only for retryable classes:
- `BACKEND_DOWN`, `TIMEOUT`, `UPSTREAM_5XX`, `RATE_LIMITED`

Do not retry for:
- `BAD_CONFIG`, `AUTH_FAILED`, `PARSE_ERROR`

Rate-limit handling:
- if `Retry-After` present, respect it (bounded by plugin max timeout budget)

---

## 6) Fallback Coupling

When adapter returns typed failure, plugin fallback layer must map to:
- `fallback: true`
- `reason` from typed error
- actionable hint (e.g., switch to `memory-core`)

No silent fallback.

---

## 7) Observability Fields

For each status/search call, emit log fields:
- `operation` (`status`/`search`)
- `backend` (`lightrag`)
- `latencyMs`
- `httpStatus`
- `errorType?`
- `retryCountUsed`
- `resultCount` (search)

---

## 8) v1 Compatibility Notes

- Adapter should tolerate LightRAG deployment differences by using endpoint probing + mapping profile.
- Keep mapping profile data-driven (path aliases), avoid hardcoding one vendor wrapper.
- If no compatible endpoint discovered, return `BAD_CONFIG` with endpoint checklist hint.
