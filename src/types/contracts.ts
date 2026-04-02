export type MemoryErrorType =
  | "BAD_CONFIG"
  | "AUTH_FAILED"
  | "BACKEND_DOWN"
  | "TIMEOUT"
  | "RATE_LIMITED"
  | "PARSE_ERROR"
  | "UPSTREAM_5XX";

export interface MemoryTypedError {
  type: MemoryErrorType;
  message: string;
  httpStatus?: number;
  retryable: boolean;
  actionHint: string;
}

export type MemoryEntityType =
  | "person"
  | "org"
  | "project"
  | "task"
  | "event"
  | "concept"
  | "artifact"
  | "location"
  | "time"
  | "other";

export interface MemoryEntity {
  id: string;
  type: MemoryEntityType;
  name: string;
  aliases?: string[];
  summary?: string;
  attributes?: Record<string, string | number | boolean | null>;
  confidence?: number;
}

export type MemoryRelationType =
  | "mentions"
  | "about"
  | "belongs_to"
  | "depends_on"
  | "causes"
  | "resolved_by"
  | "updated_by"
  | "same_as"
  | "related_to";

export interface MemoryRelation {
  id: string;
  type: MemoryRelationType;
  fromEntityId: string;
  toEntityId: string;
  weight?: number;
  evidenceSourceIds?: string[];
  confidence?: number;
}

export type MemorySourceKind = "file" | "message" | "doc" | "api" | "web" | "unknown";

export interface MemorySource {
  id: string;
  kind: MemorySourceKind;
  uri?: string;
  title?: string;
  snippet?: string;
  author?: string;
  createdAt?: string;
  updatedAt?: string;
  metadata?: Record<string, string | number | boolean | null>;
}

export interface MemorySearchItem {
  id: string;
  content: string;
  text?: string; // alias for compatibility with ontology doc/examples
  score: number | null;
  source: string;
  entities: MemoryEntity[];
  relations: MemoryRelation[];
  sources: MemorySource[];
  metadata?: Record<string, unknown>;
  provenance?: { backend: string; timestamp?: string; queryMode?: string };
}

export interface MemorySearchResult {
  ok: boolean;
  backend: "lightrag";
  query: string;
  items: MemorySearchItem[];
  meta: {
    topKApplied: number;
    truncated: boolean;
    latencyMs: number;
    requestId?: string;
    entityCount?: number;
    relationCount?: number;
    sourceCount?: number;
  };
  fallback?: boolean;
  reason?: MemoryErrorType;
  error?: MemoryTypedError;
}

// ─── Memory Object Types (P1 minimal set) ────────────────────────────────────

/** Discriminant field for memory object subtypes. */
export type MemoryObjectKind = "episode" | "decision" | "preference";

/** Minimum lifecycle states for graph memory objects. */
export type MemoryObjectState = "candidate" | "promoted" | "revoked";

/** Correction relations for memory objects. */
export interface MemoryCorrections {
  /** IDs of memory objects this object supersedes (correction/replacement). */
  supersedes?: string[];
  /** IDs of memory objects this object contradicts (correction/conflict). */
  contradicts?: string[];
}

/** A bounded interaction or event, usually created from a turn or grouped turns. */
export interface MemoryEpisode extends MemoryCorrections {
  readonly kind: "episode";
  id: string;
  timestamp: string; // ISO-8601
  summary: string;
  sourceIds: string[];
  state: MemoryObjectState;
  participants?: string[];
  about?: string[];
}

/** An explicit conclusion or chosen direction with future impact. */
export interface MemoryDecision extends MemoryCorrections {
  readonly kind: "decision";
  id: string;
  statement: string;
  effectiveAt: string; // ISO-8601
  sourceIds: string[];
  state: MemoryObjectState;
  about?: string[];
}

/** A stable user/team preference or working convention. */
export interface MemoryPreference extends MemoryCorrections {
  readonly kind: "preference";
  id: string;
  owner: string;
  statement: string;
  sourceIds: string[];
  state: MemoryObjectState;
  scope?: string;
}

// ─── Validation helpers ─────────────────────────────────────────────────────

export type MemoryObject = MemoryEpisode | MemoryDecision | MemoryPreference;

export interface MemoryObjectValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Validate a MemoryObject and return errors.
 * Every object must have: id, non-empty sourceIds, and a valid state.
 * Each subtype additionally requires its own required fields.
 * Correction fields (supersedes, contradicts) must be arrays of strings if present.
 */
export function validateMemoryObject(obj: MemoryObject): MemoryObjectValidationResult {
  const errors: string[] = [];

  if (!obj.id || typeof obj.id !== "string") errors.push("missing or invalid id");
  if (!Array.isArray(obj.sourceIds) || obj.sourceIds.length === 0) errors.push("sourceIds is required and non-empty");
  if (!obj.state || !["candidate", "promoted", "revoked"].includes(obj.state)) {
    errors.push(`invalid state: ${obj.state}`);
  }

  // Validate correction fields
  if (obj.supersedes !== undefined) {
    if (!Array.isArray(obj.supersedes)) errors.push("supersedes must be an array");
    else if (!obj.supersedes.every((id) => typeof id === "string" && id)) errors.push("supersedes must contain non-empty string IDs");
  }
  if (obj.contradicts !== undefined) {
    if (!Array.isArray(obj.contradicts)) errors.push("contradicts must be an array");
    else if (!obj.contradicts.every((id) => typeof id === "string" && id)) errors.push("contradicts must contain non-empty string IDs");
  }

  if (obj.kind === "episode") {
    if (!obj.timestamp) errors.push("episode requires timestamp");
    if (!obj.summary || typeof obj.summary !== "string" || !obj.summary.trim()) errors.push("episode requires non-empty summary");
  } else if (obj.kind === "decision") {
    if (!obj.statement || typeof obj.statement !== "string" || !obj.statement.trim()) {
      errors.push("decision requires non-empty statement");
    }
    if (!obj.effectiveAt) errors.push("decision requires effectiveAt");
  } else if (obj.kind === "preference") {
    if (!obj.owner || typeof obj.owner !== "string") errors.push("preference requires owner");
    if (!obj.statement || typeof obj.statement !== "string" || !obj.statement.trim()) {
      errors.push("preference requires non-empty statement");
    }
  } else {
    errors.push(`unknown memory object kind: ${(obj as any).kind}`);
  }

  return { valid: errors.length === 0, errors };
}

// ─── Idempotency key helpers ────────────────────────────────────────────────

import { createHash } from "node:crypto";

/**
 * Stable idempotency key composition per object type.
 * Algorithm must remain stable and versioned — change version when composition changes.
 */
export const IDEMPOTENCY_VERSION = "v1";

/** Compute a SHA-1 hex string for an idempotency key. Uses Node.js crypto for correctness. */
function stableSha1(input: string): string {
  return createHash("sha1").update(input, "utf8").digest("hex");
}

export function episodeIdempotencyKey(obj: Pick<MemoryEpisode, "summary" | "timestamp">): string {
  // Coarse date (YYYY-MM-DD) distinguishes same summary at different calendar dates
  // while allowing exact duplicate detection within the same day
  const dateKey = obj.timestamp ? obj.timestamp.slice(0, 10) : "unknown-date";
  return stableSha1(
    `${IDEMPOTENCY_VERSION}:episode:${obj.summary}:${dateKey}`,
  );
}

export function decisionIdempotencyKey(obj: Pick<MemoryDecision, "statement" | "effectiveAt">): string {
  // effectiveAt distinguishes the same decision statement made at different times
  const dateKey = obj.effectiveAt ? obj.effectiveAt.slice(0, 10) : "unknown-date";
  return stableSha1(
    `${IDEMPOTENCY_VERSION}:decision:${obj.statement}:${dateKey}`,
  );
}

export function preferenceIdempotencyKey(obj: Pick<MemoryPreference, "owner" | "statement">): string {
  return stableSha1(
    `${IDEMPOTENCY_VERSION}:preference:${obj.owner}:${obj.statement}`,
  );
}

export interface MemoryStatusResult {
  ok: boolean;
  backend: "lightrag";
  healthy: boolean;
  latencyMs?: number;
  diagnostics?: string[];
  fallback?: boolean;
  reason?: MemoryErrorType;
  error?: MemoryTypedError;
}
