/**
 * Memory Object Serialization
 *
 * Converts typed memory objects (Episode, Decision, Preference) into a
 * plain-text format suitable for LightRAG ingestion.
 *
 * Format per object kind:
 *
 * [KIND: episode]
 * ID: <id>
 * TIMESTAMP: <ISO-8601>
 * SUMMARY: <text>
 * SOURCE_IDS: <comma-separated ids>
 * STATE: <candidate|promoted|revoked>
 * PARTICIPANTS: <comma-separated names or empty>
 * ABOUT: <comma-separated topics or empty>
 * SUPERSEDES: <comma-separated ids or empty>
 * CONTRADICTS: <comma-separated ids or empty>
 *
 * [KIND: decision]
 * ID: <id>
 * TIMESTAMP: <ISO-8601>
 * STATEMENT: <text>
 * EFFECTIVE_AT: <ISO-8601>
 * SOURCE_IDS: <comma-separated ids>
 * STATE: <candidate|promoted|revoked>
 * ABOUT: <comma-separated topics or empty>
 * SUPERSEDES: <comma-separated ids or empty>
 * CONTRADICTS: <comma-separated ids or empty>
 *
 * [KIND: preference]
 * ID: <id>
 * TIMESTAMP: <ISO-8601>
 * OWNER: <name>
 * STATEMENT: <text>
 * SOURCE_IDS: <comma-separated ids>
 * STATE: <candidate|promoted|revoked>
 * SCOPE: <context or empty>
 * SUPERSEDES: <comma-separated ids or empty>
 * CONTRADICTS: <comma-separated ids or empty>
 */

import type { MemoryObject } from "../types/contracts.ts";

/**
 * Serialize a memory object into a structured plain-text format.
 * The format is designed to be:
 * - human-readable for debugging
 * - parseable by simple line-oriented tools
 * - compatible with LightRAG's text ingestion
 */
export function serializeMemoryObject(obj: MemoryObject, idempotencyKey?: string): string {
  const lines: string[] = [];

  lines.push(`[KIND: ${obj.kind}]`);

  if (obj.kind === "episode") {
    lines.push(`ID: ${obj.id}`);
    lines.push(`TIMESTAMP: ${obj.timestamp}`);
    lines.push(`SUMMARY: ${obj.summary}`);
    lines.push(`SOURCE_IDS: ${obj.sourceIds.join(",")}`);
    lines.push(`STATE: ${obj.state}`);
    if (obj.participants && obj.participants.length > 0) {
      lines.push(`PARTICIPANTS: ${obj.participants.join(",")}`);
    }
    if (obj.about && obj.about.length > 0) {
      lines.push(`ABOUT: ${obj.about.join(",")}`);
    }
  } else if (obj.kind === "decision") {
    lines.push(`ID: ${obj.id}`);
    lines.push(`TIMESTAMP: ${obj.effectiveAt}`);
    lines.push(`STATEMENT: ${obj.statement}`);
    lines.push(`EFFECTIVE_AT: ${obj.effectiveAt}`);
    lines.push(`SOURCE_IDS: ${obj.sourceIds.join(",")}`);
    lines.push(`STATE: ${obj.state}`);
    if (obj.about && obj.about.length > 0) {
      lines.push(`ABOUT: ${obj.about.join(",")}`);
    }
  } else if (obj.kind === "preference") {
    lines.push(`ID: ${obj.id}`);
    lines.push(`TIMESTAMP: ${new Date().toISOString()}`);
    lines.push(`OWNER: ${obj.owner}`);
    lines.push(`STATEMENT: ${obj.statement}`);
    lines.push(`SOURCE_IDS: ${obj.sourceIds.join(",")}`);
    lines.push(`STATE: ${obj.state}`);
    if (obj.scope) {
      lines.push(`SCOPE: ${obj.scope}`);
    }
  }

  if (idempotencyKey) {
    lines.push(`IDEMPOTENCY_KEY: ${idempotencyKey}`);
  }

  // Correction relations (P1 correction contract)
  if (obj.supersedes && obj.supersedes.length > 0) {
    lines.push(`SUPERSEDES: ${obj.supersedes.join(",")}`);
  }
  if (obj.contradicts && obj.contradicts.length > 0) {
    lines.push(`CONTRADICTS: ${obj.contradicts.join(",")}`);
  }

  return lines.join("\n");
}

/**
 * Parse a serialized memory object back into a structured object.
 * Returns null if the text does not match the expected format.
 */
export function parseMemoryObject(text: string): MemoryObject | null {
  const lines = text.trim().split("\n");
  if (lines.length < 2) return null;

  const kindLine = lines[0]!.trim();
  if (!kindLine.startsWith("[KIND:") || !kindLine.endsWith("]")) return null;
  const kind = kindLine.slice(6, -1).trim() as MemoryObject["kind"];
  if (!["episode", "decision", "preference"].includes(kind)) return null;

  const fields: Record<string, string> = {};
  for (const line of lines.slice(1)) {
    const colonIdx = line.indexOf(":");
    if (colonIdx < 0) continue;
    const key = line.slice(0, colonIdx).trim();
    const value = line.slice(colonIdx + 1).trim();
    fields[key] = value;
  }

  const sourceIds = (fields["SOURCE_IDS"] || "").split(",").filter(Boolean);
  const state = (fields["STATE"] || "candidate") as MemoryObject["state"];

  const supersedes = fields["SUPERSEDES"]
    ? fields["SUPERSEDES"]!.split(",").filter(Boolean)
    : undefined;
  const contradicts = fields["CONTRADICTS"]
    ? fields["CONTRADICTS"]!.split(",").filter(Boolean)
    : undefined;

  if (kind === "episode") {
    if (!fields["TIMESTAMP"] || !fields["SUMMARY"]) return null;
    return {
      kind: "episode",
      id: fields["ID"] || "",
      timestamp: fields["TIMESTAMP"],
      summary: fields["SUMMARY"],
      sourceIds,
      state,
      participants: fields["PARTICIPANTS"] ? fields["PARTICIPANTS"]!.split(",") : undefined,
      about: fields["ABOUT"] ? fields["ABOUT"]!.split(",") : undefined,
      supersedes: supersedes?.length ? supersedes : undefined,
      contradicts: contradicts?.length ? contradicts : undefined,
    };
  }

  if (kind === "decision") {
    if (!fields["STATEMENT"] || !fields["EFFECTIVE_AT"]) return null;
    return {
      kind: "decision",
      id: fields["ID"] || "",
      statement: fields["STATEMENT"],
      effectiveAt: fields["EFFECTIVE_AT"],
      sourceIds,
      state,
      about: fields["ABOUT"] ? fields["ABOUT"]!.split(",") : undefined,
      supersedes: supersedes?.length ? supersedes : undefined,
      contradicts: contradicts?.length ? contradicts : undefined,
    };
  }

  if (kind === "preference") {
    if (!fields["OWNER"] || !fields["STATEMENT"]) return null;
    return {
      kind: "preference",
      id: fields["ID"] || "",
      owner: fields["OWNER"],
      statement: fields["STATEMENT"],
      sourceIds,
      state,
      scope: fields["SCOPE"] || undefined,
      supersedes: supersedes?.length ? supersedes : undefined,
      contradicts: contradicts?.length ? contradicts : undefined,
    };
  }

  return null;
}
