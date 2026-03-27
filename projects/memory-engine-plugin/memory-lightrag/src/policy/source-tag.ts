import type { MemoryDomain } from "./domain-routing.js";

function clean(input: string): string {
  return (input || "").replace(/[^a-zA-Z0-9_-]/g, "_");
}

export function buildPolicyFileSource(params: {
  domain: MemoryDomain;
  actorUserId?: string | null;
  groupId?: string | null;
  topic?: string;
}): string {
  const topic = clean(params.topic || "memo");
  if (params.domain === "personal") {
    return `u__${clean(params.actorUserId || "anonymous")}__${topic}`;
  }
  if (params.domain === "group") {
    return `g__${clean(params.groupId || "unknown")}__${topic}`;
  }
  return `s__global__${topic}`;
}

export function classifySourceDomain(pathOrSource: string): MemoryDomain | "unknown" {
  if (pathOrSource.startsWith("u__")) return "personal";
  if (pathOrSource.startsWith("g__")) return "group";
  if (pathOrSource.startsWith("s__global__")) return "shared";
  return "unknown";
}

export function isAllowedByDomain(pathOrSource: string, params: {
  domain: MemoryDomain;
  actorUserId?: string | null;
  groupId?: string | null;
}): boolean {
  const v = pathOrSource || "";
  if (params.domain === "personal") {
    const u = `u__${clean(params.actorUserId || "anonymous")}__`;
    return v.startsWith(u) || v.startsWith("s__global__");
  }
  if (params.domain === "group") {
    const g = `g__${clean(params.groupId || "unknown")}__`;
    return v.startsWith(g) || v.startsWith("s__global__");
  }
  return v.startsWith("s__global__");
}

export function redactRejectedSnippet(_: string): string {
  return "[REDACTED_BY_DOMAIN_POLICY]";
}
