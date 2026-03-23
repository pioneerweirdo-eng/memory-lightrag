# T6_ADAPTER_TASK — LightRAG Minimal HTTP Adapter Contract (v1, typed recall)

## Goal
Define the minimal adapter contract between `memory-lightrag` plugin and LightRAG backend for:
- `memory status`
- `memory search`

This version upgrades from text-only normalization to **typed recall contract** aligned with `docs/memory-ontology.md`.

---

## 1) Adapter Interface (conceptual)

### `checkHealth()`
- Purpose: backend availability + diagnostics for `memory status`
- Returns:
```ts
{
  healthy: boolean;
  backend: "lightrag";
  latencyMs: number;
  backendVersion?: string;
  diagnostics: string[];
}
```

### `search(query, options)`
- Purpose: retrieve memory candidates for `memory search`
- Input:
  - `query: string`
  - `topK?: number`
  - `mode?: "mix" | "hybrid" | "local" | "global" | "naive" | "bypass"`
  - `timeoutMs?: number`
- Returns: `MemorySearchResult` (typed schema; see §3)

---

## 2) HTTP Mapping (v1)

## Health Mapping
- Preferred probe order:
  1. `GET /health`
  2. fallback `GET /status`
- Success criteria:
  - HTTP 2xx
  - parseable response (JSON preferred)

## Search Mapping
- Preferred endpoint: `POST /query/data` (structured retrieval)
- Fallback endpoint: `POST /query` (text response + references)

### Normalized request body
```json
{
  "query": "<text>",
  "mode": "mix",
  "top_k": 6,
  "include_references": true,
  "include_chunk_content": false,
  "stream": false
}
```

Headers:
- `Content-Type: application/json`
- `Authorization: Bearer <apiKey>` when configured

---

## 3) Typed Search Output Contract (v1)

Adapter must normalize to ontology-aligned shape:

```json
{
  "ok": true,
  "backend": "lightrag",
  "query": "...",
  "items": [
    {
      "id": "rec:1",
      "score": 0.82,
      "text": "...",
      "entities": [
        { "id": "ent:1", "type": "person", "name": "Alice" }
      ],
      "relations": [
        { "id": "rel:1", "type": "related_to", "fromEntityId": "ent:1", "toEntityId": "ent:2" }
      ],
      "sources": [
        { "id": "src:1", "kind": "file", "uri": "/path/doc.md", "snippet": "..." }
      ],
      "provenance": {
        "backend": "lightrag",
        "retrievedAt": "2026-03-23T00:00:00Z",
        "queryMode": "mix"
      }
    }
  ],
  "meta": {
    "topKApplied": 6,
    "truncated": false,
    "latencyMs": 138,
    "entityCount": 1,
    "relationCount": 1,
    "sourceCount": 1
  }
}
```

Rules:
- Preserve `text` for backward compatibility.
- If graph fields absent, return empty `entities[]/relations[]` and synthesize at least one `sources[]` entry when possible.
- Clamp numeric confidence/weight fields to `[0,1]`.

---

## 4) Response Normalization Rules

### A) `/query/data` success (`status=success`)
- `data.entities[]` -> `items[].entities[]`
- `data.relationships[]` -> `items[].relations[]`
- `data.chunks[]` + `data.references[]` -> `items[].sources[]` + `items[].text`
- `metadata.query_mode` -> `items[].provenance.queryMode`

### B) `/query` success
- `response` -> single `item.text`
- `references[]` -> `sources[]`
- `entities[]/relations[]` remain empty in v1 (unless extra metadata exists)

### C) Unknown/legacy payloads (`items[]` or `results[]`)
- Best-effort map `text/content/score/source`
- Place unknown fields into `sources[].metadata`

---

## 5) Error Taxonomy (typed)

- `BAD_CONFIG` (invalid URL/key/params)
- `AUTH_FAILED` (401/403)
- `BACKEND_DOWN` (connection refused/DNS)
- `TIMEOUT` (request timeout)
- `RATE_LIMITED` (429)
- `PARSE_ERROR` (invalid payload/schema mismatch)
- `UPSTREAM_5XX` (500/502/503/504)

Each error must include:
```json
{
  "type": "TIMEOUT",
  "message": "...",
  "httpStatus": 504,
  "retryable": true,
  "actionHint": "Increase timeout or check backend load"
}
```

---

## 6) Timeout / Retry Policy (v1)

Defaults:
- `timeoutMs = 6000`
- `retryCount = 1`
- `retryBackoffMs = 300`

Retry only for:
- `BACKEND_DOWN`, `TIMEOUT`, `UPSTREAM_5XX`, `RATE_LIMITED`

Do not retry:
- `BAD_CONFIG`, `AUTH_FAILED`, `PARSE_ERROR`

If `Retry-After` exists on 429, respect it (bounded by timeout budget).

---

## 7) Fallback Coupling

On adapter failure, plugin must return explicit fallback marker (no silent fallback):

```json
{
  "fallback": true,
  "reason": "BACKEND_DOWN",
  "error": {
    "type": "BACKEND_DOWN",
    "retryable": true,
    "actionHint": "Switch plugins.slots.memory to memory-core if outage persists"
  }
}
```

---

## 8) Observability Fields

For each status/search call, emit:
- `operation` (`status`/`search`)
- `resolvedEndpoint`
- `backend` (`lightrag`)
- `latencyMs`
- `httpStatus`
- `errorType` (if any)
- `retryCountUsed`
- `resultCount` (search)
- `entityCount` / `relationCount` / `sourceCount` (search)

---

## 9) v1 Constraints

- v1 scope is **status/search only**.
- Endpoint profile is data-driven (alias list), but implementation target is local LightRAG API (`/health`, `/query/data`, `/query`).
- If no compatible endpoint resolves, return `BAD_CONFIG` with endpoint checklist hint.
