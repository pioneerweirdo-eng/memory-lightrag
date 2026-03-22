# memory-lightrag 插件架构（OpenClaw）

## 目标
将记忆系统升级为 OpenClaw **memory 插件**，并复用 LightRAG 作为检索/索引引擎（不重写 RAG 核心算法）。

## 依据（已核对）
- OpenClaw 支持 `kind: "memory"` 插件，并通过 `plugins.slots.memory` 激活。
- 已有 `memory-core` / `memory-lancedb` 作为可参考实现。
- LightRAG 作为外部成熟实现，负责检索与结构化召回；本插件只做编排与适配。

## 设计原则
1. 单一事实源：会话原始内容仍由 OpenClaw 会话系统保存。
2. 插件只做胶水：capture / recall / consolidation 调度与 IO 适配。
3. 不在插件内重写向量索引、图检索、rerank 等 LightRAG 能力。
4. 可审计：所有自动写入行为有可追踪日志和可关闭开关。

## 模块边界
- `memory-lightrag` 插件：
  - Auto-Capture（候选记忆提取 + 发送到 LightRAG）
  - Auto-Recall（查询时召回 top-k + 注入提示区）
  - Memory Prompt Section（提醒先检索再回答）
  - Memory CLI（状态/探活/回填）
- LightRAG 服务：
  - 文档/片段索引
  - 混合检索（语义 + 结构）
  - 可选 rerank

## 最小配置草案
```json5
{
  plugins: {
    slots: { memory: "memory-lightrag" },
    entries: {
      "memory-lightrag": {
        enabled: true,
        baseUrl: "http://127.0.0.1:9621",
        apiKey: "${LIGHTRAG_API_KEY}",
        autoCapture: true,
        autoRecall: true,
        recallTopK: 6,
        recallBudgetChars: 1800,
        minScore: 0.55
      }
    }
  }
}
```

## 分阶段实施
### Phase 1（先可用）
- 插件骨架 + 配置校验 + 探活 CLI。
- `memory_search` 替换为 LightRAG 查询适配。
- Prompt 注入区支持 citations / no-citations 两模式。

### Phase 2（增强）
- auto-capture（规则 + 长度阈值 + 注入防护）
- after-turn 批量写入（减少 API 次数）
- provenance/confidence 字段

### Phase 3（治理）
- consolidation 策略（重复/重要性晋升）
- decay 策略（时间衰减/访问衰减）
- 质量指标（命中率、误召回率、token 成本）

## 风险与规避
- 风险：LightRAG 服务不可用 -> 回答质量下降
  - 规避：降级回 `memory-core` / file memory。
- 风险：误召回导致幻觉
  - 规避：召回内容标注为“参考证据”，禁止当作指令执行。
- 风险：写入过量导致噪音
  - 规避：capture 阈值 + 去重 + 分层晋升。
