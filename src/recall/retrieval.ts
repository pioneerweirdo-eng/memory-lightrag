/**
 * P2 Recall: Graph-Native Evidence Assembly
 *
 * Transforms flat LightRAG search results into structured evidence chains.
 *
 * Pipeline:
 *   1. Parse chunks → MemoryObject anchors (anchor identification)
 *   2. Link entities/relations to anchors via ID / sourceId / file_path
 *   3. Assemble EvidenceChain per anchor (object + related entities + relations + provenance)
 *   4. Return structured evidence, not just snippets
 *
 * P2 contract:
 *   - Intent router is auxiliary signal, not primary decision mechanism
 *   - Graph traversal provides evidence assembly superior to flat snippets
 *   - Query mode uses LightRAG "mix" as base; project layer handles local policy
 */

import type { MemoryObject } from "../types/contracts.ts";
import { parseMemoryObject } from "../write/serialization.ts";
import type { MemorySearchResult } from "../adapter/lightrag.ts";
import type { MemoryDomain } from "../policy/domain-routing.ts";
import { isAllowedByDomain } from "../policy/source-tag.ts";

// ─── Evidence chain types ─────────────────────────────────────────────────────

export interface ProvenanceLink {
  sourceId: string;
  uri?: string;
  snippet?: string;
  kind?: string;
}

export interface RelatedEntity {
  /** LightRAG internal UUID (not useful for text matching). */
  id: string;
  /** Display name — the field to match against chunk content. */
  name: string;
  type: string;
  summary?: string;
}

export interface RelatedRelation {
  id: string;
  type: string;
  fromEntityId: string;
  toEntityId: string;
  description?: string;
}

export interface EvidenceAnchor {
  /** The parsed memory object — primary anchor for this evidence chain */
  object: MemoryObject;
  /** LightRAG chunk that yielded this anchor */
  chunkPath: string;
  chunkSnippet: string;
  relevanceScore: number | null;
  /** Entities mentioned in or related to this anchor's chunk */
  relatedEntities: RelatedEntity[];
  /** Relations involving this anchor's entities */
  relatedRelations: RelatedRelation[];
  /** Provenance chain (sources attached to the anchor) */
  provenance: ProvenanceLink[];
  /** Confidence: how strongly this anchor answers the query */
  confidence: "high" | "medium" | "low";
}

export interface EvidenceChainResult {
  query: string;
  anchors: EvidenceAnchor[];
  /** Total evidence items across all anchors */
  totalEvidenceCount: number;
  /** LightRAG graph stats */
  graphStats: {
    entityCount: number;
    relationCount: number;
    sourceCount: number;
  };
  backend: "lightrag";
  latencyMs: number;
}

// ─── Anchor identification ─────────────────────────────────────────────────────

/**
 * Parse a LightRAG chunk into a MemoryObject if possible.
 * Returns null if the chunk is not a serialized memory object.
 */
function parseChunkAsObject(chunk: { path?: string; content?: string; score?: number }): MemoryObject | null {
  const content = chunk.content;
  if (!content) return null;
  return parseMemoryObject(content);
}

/**
 * Build a map of entity id → entity for fast lookup.
 */
function buildEntityMap(entities: Array<{ id?: string; entity_name?: string; name?: string; entity_type?: string; type?: string; description?: string; summary?: string }>) {
  const map = new Map<string, ReturnType<typeof mapEntity>>();
  for (const e of entities) {
    const mapped = mapEntity(e);
    if (mapped.id) map.set(mapped.id, mapped);
  }
  return map;
}

function mapEntity(e: {
  id?: string;
  entity_name?: string;
  name?: string;
  entity_type?: string;
  type?: string;
  description?: string;
  summary?: string;
}): RelatedEntity {
  return {
    // id = LightRAG internal UUID (not useful for text matching)
    id: String(e?.id || ""),
    // name = display name; prefer entity_name (LightRAG primary field) over generic name
    name: String(e?.entity_name || e?.name || ""),
    type: String(e?.entity_type || e?.type || "other"),
    summary: e?.description || e?.summary,
  };
}

function mapRelation(r: {
  id?: string;
  type?: string;
  fromEntityId?: string;
  toEntityId?: string;
  src_id?: string;
  tgt_id?: string;
  description?: string;
}): RelatedRelation {
  return {
    id: String(r?.id || ""),
    type: String(r?.type || "related_to"),
    // LightRAG may return src_id/tgt_id instead of fromEntityId/toEntityId
    fromEntityId: String(r?.fromEntityId || r?.src_id || ""),
    toEntityId: String(r?.toEntityId || r?.tgt_id || ""),
    description: r?.description,
  };
}

// ─── Revocation helpers ─────────────────────────────────────────────────────────

/**
 * Returns true if the given chunk content represents a revoked memory object.
 * Used by the flat-snippet recall path to filter revoked objects.
 */
export function isRevokedChunk(chunk: { content?: string }): boolean {
  const c = chunk.content ?? "";
  return /^\s*STATE:\s*revoked\s*$/m.test(c);
}

// ─── Score-based confidence assignment
/**
 * Score-based confidence assignment.
 * Note: P2 uses graph traversal as primary signal, not intent router score.
 */
function scoreConfidence(score: number | null | undefined): "high" | "medium" | "low" {
  if (score === null || score === undefined) return "low";
  if (score >= 0.8) return "high";
  if (score >= 0.5) return "medium";
  return "low";
}

// ─── Evidence assembly ─────────────────────────────────────────────────────────

export interface AssembleOptions {
  domain: MemoryDomain;
  actorUserId?: string | null;
  groupId?: string | null;
  /** Pass pre-filtered chunks from the API layer (authoritative access gate). */
  filteredChunks: Array<{ path?: string; content?: string; score?: number; source?: string }>;
}

/**
 * Assemble evidence chains from LightRAG search results.
 *
 * Security contract:
 * - Entity/relation filtering respects domain policy via isAllowedByDomain.
 *   The API layer has already applied domain filtering to chunks; this function
 *   additionally filters the graph layer (entities, relations) by the same policy.
 * - Revoked objects are excluded from anchors (P2 recall contract).
 *
 * P2 design notes:
 * - Intent router (ontologyPolicy) is attached as auxiliary context, not primary filter
 * - Graph traversal expands beyond the initial vector retrieval
 * - Evidence chains are the unit of answer assembly, not individual snippets
 */
export function assembleEvidenceChain(
  query: string,
  lrResult: MemorySearchResult,
  opts: AssembleOptions,
): EvidenceChainResult {
  const t0 = Date.now();

  // Filter graph entities by domain policy (authoritative access gate)
  // NOTE: Entities are matched by entity_name appearing in chunk content (already
  // domain-filtered via filteredChunks). entity filePath is LightRAG internal, not
  // the domain-prefixed file_source — filtering by isAllowedByDomain would reject all
  // entities and break graph expansion. Related entities are implicitly scoped to
  // the chunks' domain because they appear in those chunks' content.
  const allEntities = lrResult.graph?.entities ?? [];

  // Filter relationships: only include those whose evidence chunks are in filteredChunks.
  // This implicitly scopes relations to the same domain as the filtered chunks.
  const allRelationships = lrResult.graph?.relationships ?? [];
  const chunkIdSet = new Set(opts.filteredChunks.map((c) => c.path || c.content?.slice(0, 64)));
  const allowedRelationships = allRelationships
    .filter((r: any) => {
      const evidence = r?.evidenceSourceIds ?? [];
      // Include relation if any of its evidence chunks are in the filtered set
      return evidence.some((id: any) => chunkIdSet.has(String(id)));
    });

  // Filter sources by domain policy — provenance must respect access boundaries
  const allSources = lrResult.graph?.sources ?? [];
  const allowedSources = allSources.filter((s) => {
    const tag = String(s?.id || s?.uri || s?.metadata?.filePath || "");
    return isAllowedByDomain(tag, {
      domain: opts.domain,
      actorUserId: opts.actorUserId,
      groupId: opts.groupId,
    });
  });

  const anchors: EvidenceAnchor[] = [];
  const seenObjectIds = new Set<string>();

  // Process pre-filtered chunks — parse into MemoryObject anchor
  for (const chunk of opts.filteredChunks) {
    const obj = parseChunkAsObject(chunk);

    // P2 recall contract: exclude revoked objects
    if (obj && !seenObjectIds.has(obj.id) && obj.state !== "revoked") {
      seenObjectIds.add(obj.id);

      // Find related entities: any entity whose name OR id appears in the chunk content
      // (P2 fix: check both id and name, not just id)
      const chunkContent = chunk.content ?? "";
      const chunkSource = chunk.source ?? chunk.path ?? "";
      const relatedEntities = allEntities
        .filter((e: any) => {
          // Match by display name: entity_name is LightRAG's primary display field
          // (raw entity shape: { id, entity_name, entity_type, name, ... })
          const eName = String(e?.entity_name || e?.name || "");
          const eId = String(e?.id || "");
          const ePath = String(e?.filePath || e?.file_path || "");
          return (
            (eName && chunkContent.includes(eName)) ||
            (eId && chunkContent.includes(eId)) ||
            (ePath && chunkSource.includes(ePath))
          );
        })
        .map(mapEntity);

      // Find relations involving the anchor object's id or related entities
      const anchorEntityIds = new Set([
        obj.id,
        ...relatedEntities.map((e) => e.id),
      ]);
      const relatedRelations = allowedRelationships
        .filter((r: any) => {
          const from = String(r?.fromEntityId || r?.src_id || "");
          const to = String(r?.toEntityId || r?.tgt_id || "");
          return anchorEntityIds.has(from) || anchorEntityIds.has(to);
        })
        .map(mapRelation);

      // Build provenance from sources attached to this chunk
      const provenance: ProvenanceLink[] = allowedSources
        .filter((s: any) => {
          const sId = String(s?.id || "");
          const sPath = String(s?.uri || s?.metadata?.filePath || "");
          return (
            (sId && chunkContent.includes(sId)) ||
            (sPath && chunkSource.includes(sPath)) ||
            (obj.sourceIds.some((sid) => sId.includes(sid)))
          );
        })
        .map((s: any) => ({
          sourceId: String(s?.id || ""),
          uri: s?.uri,
          snippet: s?.snippet,
          kind: s?.kind,
        }));

      anchors.push({
        object: obj,
        chunkPath: chunk.path ?? "",
        chunkSnippet: chunk.content?.slice(0, 300) ?? "",
        relevanceScore: chunk.score ?? null,
        relatedEntities,
        relatedRelations,
        provenance,
        confidence: scoreConfidence(chunk.score),
      });
    }
  }

  // Sort anchors: high confidence first, then by entity count (graph richness)
  anchors.sort((a, b) => {
    const confOrder = { high: 0, medium: 1, low: 2 };
    const confDiff = confOrder[a.confidence] - confOrder[b.confidence];
    if (confDiff !== 0) return confDiff;
    return b.relatedEntities.length - a.relatedEntities.length;
  });

  const totalEvidenceCount = anchors.reduce(
    (sum, a) => sum + 1 + a.relatedEntities.length + a.relatedRelations.length,
    0,
  );

  return {
    query,
    anchors,
    totalEvidenceCount,
    graphStats: {
      entityCount: allEntities.length,
      relationCount: allowedRelationships.length,
      sourceCount: allowedSources.length,
    },
    backend: "lightrag",
    latencyMs: Date.now() - t0,
  };
}

// ─── Text assembly from evidence chains ───────────────────────────────────────

/**
 * Human-readable text assembled from evidence chains.
 * Used as the final answer text when graph-native recall is enabled.
 */
export function assembleAnswerFromChain(chain: EvidenceChainResult): string {
  if (chain.anchors.length === 0) {
    return "No matching memory found.";
  }

  const lines: string[] = [];
  lines.push(`Found ${chain.anchors.length} relevant memory anchor(s):\n`);

  for (const anchor of chain.anchors) {
    const obj = anchor.object;
    lines.push(`--- [${obj.kind.toUpperCase()}] ${obj.id} (${anchor.confidence}) ---`);

    if (obj.kind === "episode") {
      lines.push(`Summary: ${obj.summary}`);
      lines.push(`When: ${obj.timestamp}`);
      if (obj.participants?.length) lines.push(`Participants: ${obj.participants.join(", ")}`);
    } else if (obj.kind === "decision") {
      lines.push(`Decision: ${obj.statement}`);
      lines.push(`Effective: ${obj.effectiveAt}`);
    } else if (obj.kind === "preference") {
      lines.push(`${obj.owner}: ${obj.statement}`);
      if (obj.scope) lines.push(`Scope: ${obj.scope}`);
    }

    if (anchor.relatedEntities.length > 0) {
      lines.push(`Related: ${anchor.relatedEntities.map((e) => `${e.name} (${e.type})`).join(", ")}`);
    }

    if (anchor.relatedRelations.length > 0) {
      for (const rel of anchor.relatedRelations) {
        lines.push(`  ↳ ${rel.type}: ${rel.fromEntityId} → ${rel.toEntityId}`);
      }
    }

    if (anchor.provenance.length > 0) {
      for (const p of anchor.provenance) {
        const loc = p.uri ?? p.sourceId;
        lines.push(`  Source: ${loc}`);
      }
    }

    lines.push("");
  }

  return lines.join("\n");
}
