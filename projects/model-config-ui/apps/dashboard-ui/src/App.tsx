import React, { useEffect, useState, useMemo, useCallback } from "react";
import { getConfig, putConfig, extractUiConfig, extractFallbacks, extractPrimary, extractProviders, probeModels } from "./api";
import type { UiConfig, SiteEntry, ProviderEntry, ModelEntry } from "./types";
import { SiteCard } from "./SiteCard";
import { SiteForm } from "./SiteForm";
import { FallbackChain } from "./FallbackChain";
import { ConfigDiff } from "./ConfigDiff";
import { AgentTab, AgentDefaults } from "./AgentTab";
import { Icon } from "./Icon";
import { SidebarNav } from "./components/SidebarNav";
import { SchemaRenderer, type FieldDefinition } from "./components/SchemaRenderer";
import { AvatarEditorModal } from "./AvatarEditorModal";
import { FeishuAdvancedPanel } from "./FeishuAdvancedPanel";

import * as schemas from "./schemas/generated";
import { useConfigStore } from "./store/configStore";
import { ActionFeedbackBar } from "./components/ActionFeedbackBar";
import { CommandPalette } from "./components/CommandPalette";

// 全局 Auth Header（来自父容器注入等）
const globalHeaders: Record<string, string> = {};

const AUTH_TOKEN_KEY = "openclaw_admin_token";

function getAuthHeader(): Record<string, string> {
  // 1. 尝试从当前 URL 查询参数获取 token (独立页面模式, 如 ?token=xxx)
  const params = new URLSearchParams(window.location.search);
  let token = params.get("token");

  // 2. 如果 URL 没带，从 LocalStorage 恢复 (持久化鉴权)
  if (!token) {
    token = localStorage.getItem(AUTH_TOKEN_KEY);
  } else {
    // 如果 URL 带了，更新缓存
    localStorage.setItem(AUTH_TOKEN_KEY, token);
  }

  if (token) return { authorization: `Bearer ${token}` };

  // 3. 尝试从父容器路径获取 (OpenClaw iframe 嵌入模式)
  try {
    const baseParts = window.parent.location.pathname.split("/");
    if (baseParts[1] === "auth") {
      const parentToken = baseParts[2];
      if (parentToken) {
        localStorage.setItem(AUTH_TOKEN_KEY, parentToken);
        return { authorization: `Bearer ${parentToken}` };
      }
    }
  } catch (e) {
    // 跨域环境下访问 window.parent 可能报错，忽略
  }

  return globalHeaders;
}

function agentDefaultsFromConfig(cfg: Record<string, unknown>): AgentDefaults {
  const ad = (cfg as any)?.agents?.defaults ?? {};
  return {
    imageModel: ad.imageModel,
    imageGenerationModel: ad.imageGenerationModel,
    pdfModel: ad.pdfModel,
    pdfMaxBytesMb: ad.pdfMaxBytesMb,
    pdfMaxPages: ad.pdfMaxPages,
    maxConcurrent: ad.maxConcurrent,
    timeoutSeconds: ad.timeoutSeconds,
    contextTokens: ad.contextTokens,
    mediaMaxMb: ad.mediaMaxMb,
    imageMaxDimensionPx: ad.imageMaxDimensionPx,
    thinkingDefault: ad.thinkingDefault,
    verboseDefault: ad.verboseDefault,
    elevatedDefault: ad.elevatedDefault,
    workspace: ad.workspace,
    repoRoot: ad.repoRoot,
    skipBootstrap: ad.skipBootstrap,
    bootstrapMaxChars: ad.bootstrapMaxChars,
    bootstrapTotalMaxChars: ad.bootstrapTotalMaxChars,
    bootstrapPromptTruncationWarning: ad.bootstrapPromptTruncationWarning,
    userTimezone: ad.userTimezone,
    timeFormat: ad.timeFormat,
    compaction: ad.compaction,
    heartbeat: ad.heartbeat,
  };
}

export default function App() {
  const { draftState, commitDraftLocally, initBaseState, updateDraft } = useConfigStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [meta, setMeta] = useState<{ etag: string; mtimeMs: number } | null>(null);

  // 主题状态（dark | light，持久化到 localStorage）
  const [theme, setTheme] = useState<"dark" | "light">(() =>
    (localStorage.getItem("openclaw_theme") as "dark" | "light") || "dark"
  );

  // 将主题同步到 <html> 的 data-theme 属性
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("openclaw_theme", theme);
  }, [theme]);

  const toggleTheme = useCallback(
    () => setTheme((t) => (t === "dark" ? "light" : "dark")),
    []
  );

  // 原始配置树（用于还原/diff对比）
  const [rawConfig, setRawConfig] = useState<Record<string, unknown>>({});

  // 本地 UI 状态树
  const [uiConfig, setUiConfig] = useState<UiConfig>({ publicSites: [], stableSites: [] });
  const [fallbacks, setFallbacks] = useState<string[]>([]);
  const [primary, setPrimary] = useState<string>("");
  const [providers, setProviders] = useState<Record<string, ProviderEntry>>({});

  // Agent 默认配置状态
  const [agentDefaults, setAgentDefaults] = useState<AgentDefaults>({});

  const [activeCategoryId, setActiveCategoryId] = useState<string>("sites");
  const [editingSite, setEditingSite] = useState<{ type: "public" | "stable"; site: Partial<SiteEntry> } | null>(null);
  const [editingAvatarAgentId, setEditingAvatarAgentId] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "success" | "error">("idle");

  // 站点拖拽排序状态
  const [siteDrag, setSiteDrag] = useState<{ fromIdx: number; type: "public" | "stable" } | null>(null);
  const [siteDragOverIdx, setSiteDragOverIdx] = useState<number | null>(null);

  // 快照基准 — 用于检测遗留 React useState 是否发生变化
  const localSnapshotRef = React.useRef<string>("");

  // 加载完成时固化快照
  useEffect(() => {
    if (!loading) {
      localSnapshotRef.current = JSON.stringify({ uiConfig, fallbacks, primary, agentDefaults });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  // 每次保存成功后也需要刷新快照
  const refreshLocalSnapshot = useCallback(() => {
    localSnapshotRef.current = JSON.stringify({ uiConfig, fallbacks, primary, agentDefaults });
  }, [uiConfig, fallbacks, primary, agentDefaults]);

  // 检测遗留状态是否有未保存的改动
  const isLocalDirty = useMemo(() =>
    localSnapshotRef.current !== "" &&
    JSON.stringify({ uiConfig, fallbacks, primary, agentDefaults }) !== localSnapshotRef.current
  , [uiConfig, fallbacks, primary, agentDefaults]);

  const headers = useMemo(() => getAuthHeader(), []);

  // ── 初始化加载 ──────────────────────────────────────────────────────────
  const fetchConfig = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await getConfig(headers);
      setMeta({ etag: res.etag, mtimeMs: res.mtimeMs });
      setRawConfig(res.config);
      initBaseState(res.config);

      setUiConfig(extractUiConfig(res.config));
      setFallbacks(extractFallbacks(res.config));
      setPrimary(extractPrimary(res.config));
      setProviders(extractProviders(res.config) as Record<string, ProviderEntry>);
      setAgentDefaults(agentDefaultsFromConfig(res.config));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, [headers]);

  /**
   * 从 rawConfig 提取 agents.list，作为 Agent 级头像编辑的唯一事实源。
   */
  const agentsList = useMemo(() => {
    const source = (draftState || rawConfig) as any;
    const list = source?.agents?.list;
    return Array.isArray(list) ? list : [];
  }, [draftState, rawConfig]);

  /**
   * 更新某个 agent 的 identity.avatar（单一事实源：draftState.agents.list）。
   * 直接写入配置草稿，避免额外中间状态与隐式同步。
   */
  const setAgentAvatar = useCallback((agentId: string, avatarDataUri: string) => {
    const idx = agentsList.findIndex((a: any) => a?.id === agentId);
    if (idx < 0) return;
    updateDraft(["agents", "list", String(idx), "identity", "avatar"], avatarDataUri);
  }, [agentsList, updateDraft]);

  const editingAvatarValue = useMemo(() => {
    if (!editingAvatarAgentId) return "";
    const target = agentsList.find((a: any) => a?.id === editingAvatarAgentId);
    return typeof target?.identity?.avatar === "string" ? target.identity.avatar : "";
  }, [agentsList, editingAvatarAgentId]);

  // ── 产生将要保存的新整体 Config 树 ──────────────────────────────────────
  const generateNextConfig = (): Record<string, unknown> => {
    // 基于最新草稿为底座，保留 UI 特制组件（如 gateway, tools 等外）
    const next = JSON.parse(JSON.stringify(draftState || rawConfig));

    // 1. 更新 plugins.entries.model-config-admin.config (持久化我们的 UI 私有状态)
    if (!next.plugins) next.plugins = {};
    if (!next.plugins.entries) next.plugins.entries = {};
    if (!next.plugins.entries["model-config-admin"]) next.plugins.entries["model-config-admin"] = {};
    next.plugins.entries["model-config-admin"].config = uiConfig;

    // 2. 更新 agents.defaults.model (primary 和 fallbacks)
    if (!next.agents) next.agents = {};
    if (!next.agents.defaults) next.agents.defaults = {};
    if (!next.agents.defaults.model) next.agents.defaults.model = {};
    next.agents.defaults.model.primary = primary;
    next.agents.defaults.model.fallbacks = fallbacks;

    // 3. 写入 agentDefaults 中非空字段
    const writeIfDefined = (key: string, val: unknown) => {
      if (val !== undefined && val !== "" && val !== null) {
        next.agents.defaults[key] = val;
      }
    };
    writeIfDefined("imageModel", agentDefaults.imageModel);
    writeIfDefined("imageGenerationModel", agentDefaults.imageGenerationModel);
    writeIfDefined("pdfModel", agentDefaults.pdfModel);
    writeIfDefined("pdfMaxBytesMb", agentDefaults.pdfMaxBytesMb);
    writeIfDefined("pdfMaxPages", agentDefaults.pdfMaxPages);
    writeIfDefined("maxConcurrent", agentDefaults.maxConcurrent);
    writeIfDefined("timeoutSeconds", agentDefaults.timeoutSeconds);
    writeIfDefined("contextTokens", agentDefaults.contextTokens);
    writeIfDefined("mediaMaxMb", agentDefaults.mediaMaxMb);
    writeIfDefined("imageMaxDimensionPx", agentDefaults.imageMaxDimensionPx);
    writeIfDefined("thinkingDefault", agentDefaults.thinkingDefault);
    writeIfDefined("verboseDefault", agentDefaults.verboseDefault);
    writeIfDefined("elevatedDefault", agentDefaults.elevatedDefault);
    writeIfDefined("workspace", agentDefaults.workspace);
    writeIfDefined("repoRoot", agentDefaults.repoRoot);
    if (agentDefaults.skipBootstrap) next.agents.defaults.skipBootstrap = true;
    writeIfDefined("bootstrapMaxChars", agentDefaults.bootstrapMaxChars);
    writeIfDefined("bootstrapTotalMaxChars", agentDefaults.bootstrapTotalMaxChars);
    writeIfDefined("bootstrapPromptTruncationWarning", agentDefaults.bootstrapPromptTruncationWarning);
    writeIfDefined("userTimezone", agentDefaults.userTimezone);
    writeIfDefined("timeFormat", agentDefaults.timeFormat);
    if (agentDefaults.compaction) next.agents.defaults.compaction = agentDefaults.compaction;
    if (agentDefaults.heartbeat) next.agents.defaults.heartbeat = agentDefaults.heartbeat;

    // ── 【高级功能自动对齐】 ─────────────────────────────────────────
    // 扫描所有 provider 模型，按权重挑选最强的专项模型
    const allProviderModels: { ref: string, id: string }[] = [];
    Object.entries(providers).forEach(([siteId, p]) => {
      p.models?.forEach(m => allProviderModels.push({ ref: `${siteId}/${m.id}`, id: m.id }));
    });

    const getW = (ref: string) => {
      const id = ref.split("/")[1]?.toLowerCase() || "";
      let w = 0;
      if (id.includes("4.6") || id.includes("5.4") || id.includes("reasoner")) w += 1000;
      if (id.includes("opus") || id.includes("max")) w += 500;
      return w;
    };

    const bestByKeyword = (kw: string) => {
      return allProviderModels
        .filter(m => m.id.toLowerCase().includes(kw))
        .sort((a, b) => getW(b.ref) - getW(a.ref))[0]?.ref;
    };

    // 若 agentDefaults 没有手动设，则自动检测填入
    if (!agentDefaults.imageModel) {
      const autoImage = bestByKeyword("vision") || bestByKeyword("gpt-4o") || bestByKeyword("claude-3.5");
      if (autoImage) next.agents.defaults.imageModel = autoImage;
    }
    const hasThinking = allProviderModels.some(m => m.id.includes("thinking") || m.id.includes("reasoner") || m.id.includes("o1"));
    if (hasThinking && !agentDefaults.thinkingDefault) next.agents.defaults.thinkingDefault = "high";

    // 4. 【关键：修复 422】同步更新 agents.defaults.models (准入白名单)
    const nextModelsCatalog: Record<string, any> = { ...(next.agents.defaults.models || {}) };
    const allRefs = [primary, ...fallbacks,
      agentDefaults.imageModel, agentDefaults.imageGenerationModel,
      agentDefaults.pdfModel, agentDefaults.compaction?.model,
      agentDefaults.heartbeat?.model,
    ].filter(Boolean) as string[];
    allRefs.forEach(ref => {
      if (!nextModelsCatalog[ref]) nextModelsCatalog[ref] = {};
    });
    next.agents.defaults.models = nextModelsCatalog;

    // 5. 更新 models.providers (聚合 Provider 定义)
    if (!next.models) next.models = {};
    const finalProviders: Record<string, any> = { ...(next.models.providers || {}) };
    
    Object.entries(providers).forEach(([id, p]) => {
      // 严格剥离 UI 私有字段 (enabled, stats 等)
      finalProviders[id] = {
        baseUrl: p.baseUrl,
        apiKey: p.apiKey,
        api: p.api,
        models: p.models, // 模型对象数组
      };
    });
    
    next.models.providers = finalProviders;

    return next;
  };

  // ── 保存配置 ────────────────────────────────────────────────────────────
  const syncLocalFromDraft = useCallback(() => {
    const cfg = useConfigStore.getState().draftState;
    if (!cfg) return;
    setUiConfig(extractUiConfig(cfg));
    setFallbacks(extractFallbacks(cfg));
    setPrimary(extractPrimary(cfg));
    setProviders(extractProviders(cfg) as Record<string, ProviderEntry>);
    setAgentDefaults(agentDefaultsFromConfig(cfg));
    localSnapshotRef.current = JSON.stringify({
      uiConfig: extractUiConfig(cfg),
      fallbacks: extractFallbacks(cfg),
      primary: extractPrimary(cfg),
      agentDefaults: agentDefaultsFromConfig(cfg),
    });
  }, []);

  const handleSave = async () => {
    if (!meta) return;
    setSaveStatus("saving");
    try {
      const nextConf = generateNextConfig();
      const body = JSON.stringify(nextConf, null, 2);
      const out = await putConfig(headers, meta.etag, body);
      commitDraftLocally();
      setMeta((m) => (m ? { ...m, etag: out.etag } : m));
      refreshLocalSnapshot();
      setSaveStatus("success");
      setTimeout(() => setSaveStatus("idle"), 2000);
      await fetchConfig();
    } catch (err: unknown) {
      console.error("Save failed:", err);
      const e = err as Error & { status?: number; detail?: unknown };
      if (e.status === 422 && Array.isArray(e.detail)) {
        const msg = (e.detail as { path?: string; message?: string }[])
          .map((d) => `${d.path ?? "?"}: ${d.message ?? ""}`)
          .join(", ");
        setError(`配置校验失败: ${msg}`);
      } else {
        setError(`保存失败: ${err instanceof Error ? err.message : String(err)}`);
      }
      setSaveStatus("error");
    }
  };

  // ── 智能路由：「公益优先模式」一键排布 ─────────────────────────────────
  const applyPublicPriority = () => {
    // 2026-03 最新 LMSYS Elo 权重映射 (基础分)
    const SERIES_WEIGHTS: Record<string, number> = {
      "claude-4.6": 6000,
      "claude-4.5": 5800,
      "gpt-5.4":   5500,
      "gpt-5.2":   5400,
      "gemini-3.1": 5300,
      "gemini-3":   5100,
      "grok-4":     5200,
      "grok-2":     4000,
      "claude-3.5-sonnet": 4500,
      "gpt-4o":     4400,
      "deepseek-v3": 4200,
    };

    const getModelWeight = (ref: string) => {
      const id = ref.split("/")[1]?.toLowerCase() || "";
      let weight = 800; // 默认基础分
      
      // 1. 系列匹配
      for (const [series, w] of Object.entries(SERIES_WEIGHTS)) {
        if (id.includes(series)) {
          weight = w;
          break;
        }
      }
      
      // 2. 动态版本号微调 (如 gpt-5.4 -> .4 * 100)
      const vMatch = id.match(/(\d+\.\d+)/);
      if (vMatch) weight += parseFloat(vMatch[1]) * 10;

      // 3. 后缀奖励 (2026 核心能力)
      if (id.includes("thinking") || id.includes("reasoner") || id.includes("o1")) weight += 1000;
      if (id.includes("codex") || id.includes("coding")) weight += 500;
      if (id.includes("max") || id.includes("ultra") || id.includes("opus")) weight += 300;
      
      // 4. 轻量级降级
      if (id.includes("mini") || id.includes("flash") || id.includes("haiku") || id.includes("lite")) weight -= 1500;

      return weight;
    };

    const publicModelRefs: string[] = [];
    uiConfig.publicSites.filter(s => s.enabled !== false).forEach(site => {
      const provider = providers[site.id];
      if (provider && Array.isArray(provider.models)) {
        provider.models.forEach(m => {
          // 过滤掉非对话类模型 (embedding/rerank 不入接力链)
          if (!m.id.includes("embedding") && !m.id.includes("rerank") && !m.id.includes("tts")) {
            publicModelRefs.push(`${site.id}/${m.id}`);
          }
        });
      }
    });

    // 公益站内部进行智能排序：基于 2026 天梯权重
    publicModelRefs.sort((a, b) => getModelWeight(b) - getModelWeight(a));

    const stableModelRefs: string[] = [];
    uiConfig.stableSites.filter(s => s.enabled !== false).forEach(site => {
      const provider = providers[site.id];
      if (provider && Array.isArray(provider.models)) {
        provider.models.forEach(m => stableModelRefs.push(`${site.id}/${m.id}`));
      }
    });
    // 稳定站也可以按此规则排序（或保持原样，这里建议保持按站点顺序，因为稳定站通常是用户付费买的，习惯固定）

    // 将非这两类（可能用户手写的）的排在最后面
    const otherRefs = fallbacks.filter(f => !publicModelRefs.includes(f) && !stableModelRefs.includes(f));

    setFallbacks([...publicModelRefs, ...stableModelRefs, ...otherRefs]);
  };

  // ── 站点管理操作 ────────────────────────────────────────────────────────
  const handleSiteSave = async (site: SiteEntry, type: "public" | "stable") => {
    // 1. 更新 UiConfig 列表
    const list = uiConfig[type === "public" ? "publicSites" : "stableSites"];
    const extIdx = list.findIndex(s => s.id === site.id);
    let newList;
    if (extIdx >= 0) {
      newList = [...list];
      newList[extIdx] = site;
    } else {
      newList = [...list, site];
    }
    setUiConfig({ ...uiConfig, [type === "public" ? "publicSites" : "stableSites"]: newList });

    // 2. 自动拉取该站点的 /v1/models 注入到 Provider 中
    try {
      const probeRes = await probeModels(headers, {
        baseUrl: site.baseUrl,
        api: site.api || "openai-completions",
        apiKey: site.apiKeyEnv && !site.apiKeyEnv.startsWith("${") ? site.apiKeyEnv : undefined,
      });
      
      const providerModels: ModelEntry[] = probeRes.models || [];
      
      // 更新 providers 树
      setProviders(prev => ({
        ...prev,
        [site.id]: {
          baseUrl: site.baseUrl,
          apiKey: site.apiKeyEnv,
          api: site.api || "openai-completions",
          models: providerModels,
        }
      }));

      // 如果是新增站点，而且探测到了可用模型，自动加入到 fallback 链底部
      if (extIdx < 0 && providerModels.length > 0) {
        const newRefs = providerModels.map(m => `${site.id}/${m.id}`);
        setFallbacks(prev => {
          const unique = new Set([...prev, ...newRefs]);
          return Array.from(unique);
        });
      }

    } catch (e) {
      console.error("Probe failed on save:", e);
      // 即便探测失败，这里也会保存一个空的 providers 项，下次用户还可以手动改
      setProviders(prev => ({
        ...prev,
        [site.id]: {
          baseUrl: site.baseUrl,
          apiKey: site.apiKeyEnv,
          api: site.api || "openai-completions",
          models: [],
        }
      }));
    }

    setEditingSite(null);
  };

  const handleProbeSuccess = (id: string, modelIds: string[]) => {
    setProviders(prev => {
      const current = prev[id];
      if (!current) return prev;
      return {
        ...prev,
        [id]: {
          ...current,
          models: modelIds.map(mid => ({ id: mid, name: mid }))
        }
      };
    });
  };

  const handleSiteDelete = (id: string, type: "public" | "stable") => {
    const prop = type === "public" ? "publicSites" : "stableSites";
    setUiConfig({ ...uiConfig, [prop]: uiConfig[prop].filter((s: SiteEntry) => s.id !== id) });
    
    // 移除 providers 中的对应项
    setProviders(prev => {
      const next = { ...prev };
      delete next[id];
      return next;
    });

    // 移除 fallbacks 中的对应模型
    setFallbacks(prev => prev.filter(ref => !ref.startsWith(`${id}/`)));
  };

  const handleSiteToggle = (id: string, enabled: boolean, type: "public" | "stable") => {
    const prop = type === "public" ? "publicSites" : "stableSites";
    setUiConfig({
      ...uiConfig,
      [prop]: uiConfig[prop].map((s: SiteEntry) => s.id === id ? { ...s, enabled } : s),
    });
  };

  // ── 站点拖拽排序 ────────────────────────────────────────────────────────
  const handleSiteDragStart = (idx: number, type: "public" | "stable") => {
    setSiteDrag({ fromIdx: idx, type });
  };

  const handleSiteDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    setSiteDragOverIdx(idx);
  };

  const handleSiteDrop = (toIdx: number, type: "public" | "stable") => {
    if (!siteDrag || siteDrag.fromIdx === toIdx || siteDrag.type !== type) return;
    const prop = type === "public" ? "publicSites" : "stableSites";
    const next = [...uiConfig[prop]];
    const [item] = next.splice(siteDrag.fromIdx, 1);
    next.splice(toIdx, 0, item);
    setUiConfig({ ...uiConfig, [prop]: next });
    setSiteDrag(null);
    setSiteDragOverIdx(null);
  };

  const handleSiteDragEnd = () => {
    setSiteDrag(null);
    setSiteDragOverIdx(null);
  };


  if (loading) return (
    <div className="empty-state" style={{ height: "100vh" }}>
      <Icon name="Loader" size={28} className="spinning" style={{ color: "var(--primary)" }} />
    </div>
  );

  // ── 统一内容渲染函数 ─────────────────────────────────────────────────────
  const renderSiteGroup = (sites: SiteEntry[], type: "public" | "stable") => (
    <div className="sites-group">
      {sites.map((s, idx) => (
        <SiteCard
          key={s.id}
          site={s}
          index={idx}
          onDragStart={(i) => handleSiteDragStart(i, type)}
          onDragOver={handleSiteDragOver}
          onDrop={(i) => handleSiteDrop(i, type)}
          onDragEnd={handleSiteDragEnd}
          isDragging={siteDrag?.type === type && siteDrag.fromIdx === idx}
          isDragOver={siteDrag?.type === type && siteDragOverIdx === idx && siteDrag.fromIdx !== idx}
          headers={headers}
          onEdit={s => setEditingSite({ type, site: s })}
          onDelete={id => handleSiteDelete(id, type)}
          onToggle={(id, enabled) => handleSiteToggle(id, enabled, type)}
          onProbeSuccess={handleProbeSuccess}
        />
      ))}
    </div>
  );

  const renderContent = () => {
    // ① 代理站点池
    if (activeCategoryId === "sites") {
      return (
        <div className="u-stack">
          {/* 公益站区块 */}
          <div className="sites-section">
            <div className="sites-group-header">
              <span className="sites-group-title">公益探测节点</span>
              <div style={{ display: "flex", gap: 6 }}>
                <button className="btn btn-ghost btn-sm" onClick={applyPublicPriority}>
                  <Icon name="Zap" size={12} /> 智能排序
                </button>
                <button className="btn btn-primary btn-sm" onClick={() => setEditingSite({ type: "public", site: {} })}>
                  <Icon name="Plus" size={12} /> 添加公益站
                </button>
              </div>
            </div>
            {uiConfig.publicSites.length === 0 ? (
              <div className="empty-state" style={{ padding: "24px 0" }}>
                <Icon name="Layers" size={28} className="spinning" style={{ color: "var(--text-dim)" }} />
                <p style={{ fontSize: 13 }}>暂无公益站点，点击右上角添加</p>
              </div>
            ) : renderSiteGroup(uiConfig.publicSites, "public")}
          </div>

          {/* 稳定站区块 */}
          <div className="sites-section">
            <div className="sites-group-header">
              <span className="sites-group-title">硬级稳定模型池</span>
              <button className="btn btn-primary btn-sm" onClick={() => setEditingSite({ type: "stable", site: {} })}>
                <Icon name="Plus" size={12} /> 添加稳定站
              </button>
            </div>
            {uiConfig.stableSites.length === 0 ? (
              <div className="empty-state" style={{ padding: "24px 0" }}>
                <Icon name="Server" size={28} style={{ color: "var(--text-dim)" }} />
                <p style={{ fontSize: 13 }}>暂无稳定站点，点击右上角添加</p>
              </div>
            ) : renderSiteGroup(uiConfig.stableSites, "stable")}
          </div>
        </div>
      );
    }

    // ② 接力链（独立入口）
    if (activeCategoryId === "fallback") {
      return (
        <div>
          <div className="page-header">
            <div>
              <div className="page-title">模型故障接力链路</div>
              <div className="page-subtitle">按优先级列出备用模型，支持拖拽调整接力顺序</div>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={applyPublicPriority}>
              <Icon name="Zap" size={13} /> 自动重排
            </button>
          </div>
          <div className="card" style={{ padding: 24 }}>
            <FallbackChain fallbacks={fallbacks} primary={primary} onChange={setFallbacks} />
          </div>
        </div>
      );
    }

    // ③ Agent 行为策略（只渲染 AgentTab，不包含 Schema 表单）
    if (activeCategoryId === "agents") {
      return (
        <div className="u-stack">
          <div className="page-header">
            <div>
              <div className="page-title">Agent 行为策略</div>
              <div className="page-subtitle">默认模型选择、上下文限制与功能开关</div>
            </div>
          </div>
          <AgentTab agentDefaults={agentDefaults} onChange={setAgentDefaults} providers={providers} />
        </div>
      );
    }

    // ④ Agent 身份管理（头像/名称，从 agents 分离出来）
    if (activeCategoryId === "identities") {
      return (
        <div className="u-stack">
          <div className="page-header">
            <div>
              <div className="page-title">Agent 身份管理</div>
              <div className="page-subtitle">设置每个 Agent 的名称、Emoji 与自定义头像</div>
            </div>
          </div>
          <div className="card" style={{ padding: 20 }}>
            <div className="agent-avatar-grid">
              {agentsList.map((agent: any) => {
                const avatar = typeof agent?.identity?.avatar === "string" ? agent.identity.avatar : "";
                const name = agent?.identity?.name || agent?.id || "未命名 Agent";
                const emoji = agent?.identity?.emoji || "🤖";
                return (
                  <div key={agent?.id || name} className="agent-avatar-card">
                    <div className="agent-avatar-head">
                      {avatar ? (
                        <img src={avatar} alt={name} className="agent-avatar-image" />
                      ) : (
                        <div className="agent-avatar-fallback">{emoji}</div>
                      )}
                      <div>
                        <div className="agent-avatar-name">{name}</div>
                        <div className="agent-avatar-id">{agent?.id || "-"}</div>
                      </div>
                    </div>
                    <button className="btn btn-ghost btn-sm" type="button"
                      onClick={() => setEditingAvatarAgentId(agent?.id || null)}>
                      <Icon name="Image" size={14} /> 编辑头像
                    </button>
                  </div>
                );
              })}
            </div>
            <div className="form-hint" style={{ marginTop: 10 }}>
              头像写入 Agent 的 identity.avatar，保存后持久化。
            </div>
          </div>
        </div>
      );
    }

    // ⑤ 配置差异预览
    if (activeCategoryId === "preview") {
      return <ConfigDiff originalConfig={rawConfig} nextConfig={generateNextConfig()} />;
    }

    // ⑥ Schema 渲染器（所有其余结构化域）
    const activeSchemaDict = (schemas as any)[`${activeCategoryId}SchemaDict`];
    if (activeSchemaDict) {
      // channels: 增加 Feishu 高级 JSON 编辑面板（用于 accounts.* / groups.* 这类 wildcard 路径）
      if (activeCategoryId === "channels") {
        return (
          <div className="animate-fade-in u-stack" style={{ gap: 14 }}>
            <div className="page-header">
              <div>
                <div className="page-title">channels 配置</div>
                <div className="page-subtitle">基于 Schema 动态映射。修改会暂存于草稿区，保存后推送至后端。</div>
              </div>
            </div>

            <FeishuAdvancedPanel />

            <SchemaRenderer
              fields={activeSchemaDict}
              prefixText={
                <>
                  提示：带 <code>*</code> 的路径（例如 <code>channels.feishu.accounts.*.appId</code>）通常代表「任意 key 的 map」。
                  建议用上方 JSON 编辑为 accounts/groups 设置具体 key（如 <code>accounts.default</code> / <code>groups.&lt;groupId&gt;</code>）。
                </>
              }
            />
          </div>
        );
      }

      return (
        <div className="animate-fade-in">
          <div className="page-header">
            <div>
              <div className="page-title">{activeCategoryId} 配置</div>
              <div className="page-subtitle">基于 Schema 动态映射。修改会暂存于草稿区，保存后推送至后端。</div>
            </div>
          </div>
          <SchemaRenderer fields={activeSchemaDict} />
        </div>
      );
    }

    // ⑦ 空状态兜底
    return (
      <div className="u-center" style={{ padding: "64px 0" }}>
        <div style={{ textAlign: "center" }}>
          <Icon name="Settings2" size={48} style={{ color: "var(--text-dim)", marginBottom: 16 }} />
          <h3 style={{ fontSize: 16, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>
            {activeCategoryId} 配置模块
          </h3>
          <p style={{ fontSize: 13, color: "var(--text-dim)", maxWidth: 320 }}>
            该配置域尚未完成 Schema 映射，正在迭代中。
          </p>
        </div>
      </div>
    );
  };

  return (
    <div style={{ display: "flex", width: "100%", height: "100vh", overflow: "hidden", background: "var(--bg-base)" }}>
      {/* ── 侧边导航 ──────────────────────────────────────────────────── */}
      <SidebarNav activeId={activeCategoryId} onSelect={setActiveCategoryId} />

      {/* ── 右侧主内容区 ──────────────────────────────────────────────── */}
      <div style={{ flex: 1, height: "100%", overflowY: "auto", position: "relative" }}>
        {/* 顶栏：标题 + 主题切换 + Ctrl+K 命令调度 */}
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          padding: "14px 24px", borderBottom: "1px solid var(--border-subtle)",
          background: "var(--bg-deep)", position: "sticky", top: 0, zIndex: 20,
        }}>
          <div>
            <span className="gradient-text" style={{ fontSize: 18, fontWeight: 700, letterSpacing: -0.3 }}>
              OpenClaw
            </span>
            <span style={{ marginLeft: 10, fontSize: 12, color: "var(--text-dim)" }}>
              {uiConfig.publicSites.length + uiConfig.stableSites.length} 站点 · {fallbacks.length} 接力模型
            </span>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <CommandPalette onSelect={setActiveCategoryId} />
            <button className="theme-toggle" onClick={toggleTheme}
              title={theme === "dark" ? "切换浅色" : "切换深色"}>
              <Icon name={theme === "dark" ? "Sun" : "Moon"} size={15} />
            </button>
          </div>
        </div>

        {/* 主内容 */}
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 24px 100px" }}>
          {/* 错误横幅 */}
          {error && (
            <div className="banner banner-error" style={{ marginBottom: 16 }}>
              <Icon name="AlertCircle" size={15} />
              {error}
            </div>
          )}
          {renderContent()}
        </div>
      </div>

      {/* ── 全局底部悬浮反馈栏（检测所有状态变化） ── */}
      <ActionFeedbackBar
        onSave={handleSave}
        isSaving={saveStatus === "saving"}
        forceDirty={isLocalDirty}
        onAfterDiscard={syncLocalFromDraft}
      />

      {/* ── 站点编辑表单弹窗 ────────────────────────────────────────── */}
      {editingSite && (
        <SiteForm
          site={editingSite.site}
          headers={headers}
          onSave={site => handleSiteSave(site, editingSite.type)}
          onClose={() => setEditingSite(null)}
        />
      )}

      {/* ── Agent 头像编辑弹窗 ──────────────────────────────────────── */}
      {editingAvatarAgentId && (
        <AvatarEditorModal
          open={Boolean(editingAvatarAgentId)}
          initialAvatar={editingAvatarValue}
          onClose={() => setEditingAvatarAgentId(null)}
          onSave={(avatarDataUri) => {
            setAgentAvatar(editingAvatarAgentId, avatarDataUri);
            setEditingAvatarAgentId(null);
          }}
        />
      )}
    </div>
  );
}


