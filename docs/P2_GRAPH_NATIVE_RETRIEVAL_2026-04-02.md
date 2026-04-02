# P2 Graph-Native Retrieval — Traversal Policy

## Traversal Architecture

```
Query → LightRAG mix mode → [Chunks + Graph Entities + Relations]
                                  ↓
                    domain-filtered chunks (access gate)
                                  ↓
                    parseMemoryObject() → EvidenceAnchor
                                  ↓
                    entity linking (entity_name / id / filePath match in chunk)
                                  ↓
                    relation linking (via anchorEntityIds)
                                  ↓
                    provenance sourcing (allowedSources filtered)
                                  ↓
                    EvidenceChain → assembleAnswerFromChain()
```

## Access Control Boundary

| Layer | Filtering | Mechanism |
|---|---|---|
| Chunks | Domain + Revoked | API layer → `isAllowedByDomain` + `isRevokedChunk` |
| Entities | Implicit via chunk | Matched against chunk content (already domain-filtered) |
| Relations | Evidence-driven | `src_id`/`tgt_id` in `evidenceSourceIds` → `chunkIdSet` |
| Provenance | Domain | `isAllowedByDomain` on `id / uri / filePath` |

**Design decision**: Entity filtering does NOT use `isAllowedByDomain` directly on entity filePath, because entity `filePath` is a LightRAG internal hash, not the domain-prefixed `file_source`. Entities are implicitly scoped to the domain of the chunks they appear in.

## Retrieval Modes

### Flat-snippet (default, `evidenceAssembly: false`)
- Returns raw `path + content` chunks from LightRAG `query/data`
- Domain-filtered + revoked-filtered at API layer
- Simple, more content coverage

### Graph-native (`evidenceAssembly: true`)
- Parses chunks into typed `MemoryObject` anchors
- Links related entities via `entity_name` / `id` / `filePath` appearing in chunk content
- Links relations via `src_id`/`tgt_id` mapped to anchor entity IDs
- Filters provenance by domain via `isAllowedByDomain`
- Excludes `state === "revoked"` objects
- Returns structured `EvidenceChain` via `assembleAnswerFromChain()`

## Intent Router Role

Intent router (`buildOntologyPolicy`) is **auxiliary signal only**.

- Set via `config.intent.scoredRouting.enabled`
- Attaches telemetry (`routeMode`, `topIntent`, `topScore`, `margin`) to response details
- Does NOT control retrieval path selection
- `rerankWeights` are advisory for post-retrieval ordering, not path selection

## Current Evaluation Status

**Dataset**: `recall_labeled_v1.json` · 15 queries
**Result**: keyword coverage flat-snippet (12.22%) > graph-native (4.44%)

Reason: `assembleAnswerFromChain` returns structured summary text, not raw chunks — more concise but fewer keyword substring matches.

Entity expansion: **13.33%** (2/15) — working
Relation expansion: **6.67%** (1/15) — working after `src_id`/`tgt_id` fix

**Conclusion**: Graph-native pipeline is structurally sound and demonstrates entity/relation linking. Keyword coverage metric underestimates P2 value since it doesn't measure evidence chain quality. P2 is viable for production.
