import type { LightragConfig } from "../config/schema.js";

export interface MemorySearchResult {
  success: boolean;
  results?: Array<{
    path: string;
    content: string;
    line?: number;
    score?: number;
    source?: string;
  }>;
  error?: string;
  backend?: "lightrag" | "builtin-fallback";
  fallback?: boolean;
  reason?: string;
  requestId?: string;
  latencyMs?: number;
}

export interface MemoryStatusResult {
  success: boolean;
  activeBackend?: "lightrag" | "builtin-fallback";
  lightragHealthy?: boolean;
  error?: string;
  latencyMs?: number;
}

function toErr(err: unknown): string {
  if (err instanceof Error) return err.message;
  return String(err);
}

function classifyReason(status?: number, errorText?: string): string {
  if (status === 401 || status === 403) return "UPSTREAM_4XX";
  if (status === 408) return "TIMEOUT";
  if (status === 429) return "UPSTREAM_4XX";
  if (typeof status === "number" && status >= 400 && status < 500) return "UPSTREAM_4XX";
  if (typeof status === "number" && status >= 500) return "UPSTREAM_5XX";
  if ((errorText || "").toLowerCase().includes("timeout")) return "TIMEOUT";
  return "BACKEND_DOWN";
}

/**
 * LightRAG API adapter
 * v1 uses /query/data for structured retrieval and maps to memory_search output shape.
 */
export class LightragAdapter {
  constructor(private readonly config: LightragConfig) {}

  private headers(workspace?: string) {
    return {
      "Content-Type": "application/json",
      ...(this.config.apiKey ? { Authorization: `Bearer ${this.config.apiKey}` } : {}),
      ...(workspace ? { "LIGHTRAG-WORKSPACE": workspace } : {}),
    };
  }

  async checkHealth(workspace?: string): Promise<MemoryStatusResult> {
    const t0 = Date.now();
    try {
      const res = await fetch(`${this.config.baseUrl}/health`, {
        headers: {
          ...(this.config.apiKey ? { Authorization: `Bearer ${this.config.apiKey}` } : {}),
          ...(workspace ? { "LIGHTRAG-WORKSPACE": workspace } : {}),
        },
        signal: AbortSignal.timeout(this.config.timeout),
      });

      const latencyMs = Date.now() - t0;
      if (!res.ok) {
        return {
          success: false,
          lightragHealthy: false,
          activeBackend: "builtin-fallback",
          error: `Health check failed: ${res.status} ${res.statusText}`,
          latencyMs,
        };
      }

      return {
        success: true,
        lightragHealthy: true,
        activeBackend: "lightrag",
        latencyMs,
      };
    } catch (err) {
      return {
        success: false,
        lightragHealthy: false,
        activeBackend: "builtin-fallback",
        error: toErr(err),
        latencyMs: Date.now() - t0,
      };
    }
  }

  async search(query: string, workspace?: string): Promise<MemorySearchResult> {
    const requestId = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
    const t0 = Date.now();

    try {
      const res = await fetch(`${this.config.baseUrl}/query/data`, {
        method: "POST",
        headers: this.headers(workspace),
        body: JSON.stringify({
          query,
          mode: "mix",
          top_k: 8,
          include_references: true,
          include_chunk_content: true,
        }),
        signal: AbortSignal.timeout(this.config.timeout),
      });

      const latencyMs = Date.now() - t0;
      if (!res.ok) {
        return {
          success: false,
          error: `query/data failed: ${res.status} ${res.statusText}`,
          backend: "lightrag",
          reason: classifyReason(res.status),
          requestId,
          latencyMs,
        };
      }

      const data = (await res.json()) as any;

      if (data?.status === "failure") {
        return {
          success: false,
          error: data?.message || "LightRAG returned failure",
          backend: "lightrag",
          reason: "INVALID_RESPONSE",
          requestId,
          latencyMs,
        };
      }

      const chunks = data?.data?.chunks;
      const references = data?.data?.references;

      const fromChunks: Array<{ path: string; content: string; score?: number; source?: string }> = Array.isArray(chunks)
        ? chunks
            .map((c: any) => ({
              path: c?.file_path || c?.path || "memory/unknown.md",
              content: c?.content || "",
              score: typeof c?.score === "number" ? c.score : undefined,
              source: c?.file_source || c?.file_path || c?.path,
            }))
            .filter((x: any) => x.content)
        : [];

      const fromRefs: Array<{ path: string; content: string; score?: number; source?: string }> =
        fromChunks.length === 0 && Array.isArray(references)
          ? references
              .map((r: any) => ({
                path: r?.file_path || "memory/unknown.md",
                content: r?.snippet || r?.content || "",
                score: typeof r?.score === "number" ? r.score : undefined,
                source: r?.file_source || r?.file_path,
              }))
              .filter((x: any) => x.content)
          : [];

      const mapped = (fromChunks.length ? fromChunks : fromRefs).slice(0, 8).map((r) => ({
        path: r.path,
        content: r.content,
        score: r.score,
        source: r.source,
      }));

      return {
        success: true,
        results: mapped,
        backend: "lightrag",
        requestId,
        latencyMs,
      };
    } catch (err) {
      const error = toErr(err);
      return {
        success: false,
        error,
        backend: "lightrag",
        reason: classifyReason(undefined, error),
        requestId,
        latencyMs: Date.now() - t0,
      };
    }
  }

  async insertText(text: string, fileSource: string, workspace?: string): Promise<{ success: boolean; trackId?: string; error?: string }> {
    try {
      const res = await fetch(`${this.config.baseUrl}/documents/text`, {
        method: "POST",
        headers: this.headers(workspace),
        body: JSON.stringify({ text, file_source: fileSource }),
        signal: AbortSignal.timeout(this.config.timeout),
      });
      if (!res.ok) {
        return { success: false, error: `documents/text failed: ${res.status} ${res.statusText}` };
      }
      const data = (await res.json()) as any;
      return { success: data?.status === "success", trackId: data?.track_id, error: data?.message };
    } catch (err) {
      return { success: false, error: toErr(err) };
    }
  }
}
