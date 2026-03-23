# T6_ENDPOINT_PROFILE — LightRAG v1 endpoint mapping profile (source-aligned)

## Goal
Eliminate endpoint ambiguity for v1 implementation using local LightRAG API behavior.

## Profile Name
`lightrag-v1-local-api`

## Base Config
- `baseUrl`: required (e.g., `http://127.0.0.1:9621`)
- `apiKey`: optional
- `timeoutMs`: 6000
- `retryCount`: 1

## Endpoint Alias Map

### Health probe (ordered)
1. `GET /health`
2. `GET /status` (compat fallback)

Probe success:
- HTTP 2xx + parseable payload

### Search endpoint (ordered)
1. `POST /query/data` (preferred structured retrieval)
2. `POST /query` (text + references fallback)

## Normalized Search Request
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

## Normalized Search Response (typed recall)
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
      "entities": [],
      "relations": [],
      "sources": [],
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
    "latencyMs": 123,
    "entityCount": 0,
    "relationCount": 0,
    "sourceCount": 0
  }
}
```

## Error Mapping Profile
- 400 (`/query/data` validation failure) -> `BAD_CONFIG` / `PARSE_ERROR` (by cause)
- 401/403 -> `AUTH_FAILED`
- 429 -> `RATE_LIMITED`
- 500/502/503/504 -> `UPSTREAM_5XX`
- Timeout -> `TIMEOUT`
- Connection/DNS -> `BACKEND_DOWN`

## Retry Policy Profile
- Retryable: `BACKEND_DOWN`, `TIMEOUT`, `UPSTREAM_5XX`, `RATE_LIMITED`
- Non-retryable: `BAD_CONFIG`, `AUTH_FAILED`, `PARSE_ERROR`
- Backoff: linear 300ms (single retry)

## Fallback Hint Profile
On typed failure:
- return `fallback=true`
- include deterministic `reason`
- include `actionHint` (e.g., switch `plugins.slots.memory` to `memory-core` if outage persists)

## v1 Constraint
If neither health nor search aliases resolve, abort with `BAD_CONFIG` and endpoint checklist message.
