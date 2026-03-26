# MAMGA（论文+代码）× memory-lightrag 记忆建模深度对比与迁移方案

- 日期：2026-03-26 (UTC)
- 输入来源：
  - 论文：<https://arxiv.org/abs/2601.03236>
  - 代码：<https://github.com/FredJiang0324/MAMGA>
- 目标：聚焦 memory 建模，提炼可迁移到 `memory-lightrag`（重点本体论）的设计与实现路径。

---

## 0. Executive Summary（先给结论）

**一句话结论**：
`memory-lightrag` 已有“轻量本体 + 域隔离”基础，但目前检索链路仍以 chunk 文本为主，尚未真正把图关系作为一等检索对象。MAMGA 的核心价值不在“再加一层图谱”，而在于三件事：

1. **多关系正交建模**（semantic / temporal / causal / entity）
2. **意图驱动的自适应遍历策略**（不是静态 top-k）
3. **双通道记忆演化**（快写入 + 慢整合）

对 `memory-lightrag` 最可落地的迁移路线是：
- 先做 **Graph-preserving 输出**（不破坏 text fallback）；
- 再做 **Intent-aware 重排与遍历**；
- 最后做 **异步结构整合**。

---

## 1. MAMGA 的 memory 建模：论文与代码交叉验证

## 1.1 论文侧（arXiv:2601.03236）

### A) 多图记忆基底（核心建模假设）
- 论文明确提出将每条记忆映射到四个正交关系视图：**semantic / temporal / causal / entity**，并强调“解耦表示与检索逻辑”。
  - 证据：摘要与引言（HTML 抽取行 98-100, 137-140, 148-160）
- 数据结构定义为时间变化有向多重图 \(\mathcal{G}_t=(\mathcal{N}_t,\mathcal{E}_t)\)。
  - 证据：3.2（行 246）

### B) 检索不是“查库”，而是“策略化遍历”
- 3.3 章节：由 Router 先做 query 结构化，再执行多阶段检索。
- 锚点构建使用 **RRF** 融合 dense + keyword + temporal 信号。
  - 证据：3.3（行 299, 303, 327）
- 遍历评分由 query intent 动态加权（例如 WHY 强调 causal）。
  - 证据：3.3（行 341, 361, 467）

### C) 记忆演化是双流（Fast/Slow）
- Fast Path：低延迟写入，不做阻塞式 LLM 推理。
- Slow Path：后台 consolidation，补 causal / entity 高价值边。
  - 证据：3.4（行 498, 502, 547, 556）

### D) 实验信号（有代价也有收益）
- LoCoMo、LongMemEval 上准确性和效率更优（文中报告）。
  - 证据：4.x（行 729, 732, 810, 816, 826）
- 局限性：多图与双流确实增加工程复杂度。
  - 证据：Limitations（行 944）

---

## 1.2 代码侧（MAMGA 仓库）

> 代码目录命名为 `memory/*`，核心文件含 `trg_memory.py`、`query_engine.py`、`graph_db.py`。

### A) 类型层：节点/边就是本体
- `graph_db.py` 定义：
  - NodeType: `EVENT / EPISODE / ENTITY / SESSION ...`
  - LinkType: `TEMPORAL / SEMANTIC / CAUSAL / ENTITY`
  - LinkSubType: `PRECEDES / LEADS_TO / BELONGS_TO_SESSION / REFERS_TO ...`
  - 证据：`graph_db.py` 行 18-57

### B) 检索层：RRF + query intent +图遍历
- `QueryEngine._rrf_fusion()`：标准 RRF（k=60）融合多检索列表。
  - 证据：`query_engine.py` 行 55-116
- `detect_query_intent()`：WHY / WHEN / ENTITY 分流。
  - 证据：`query_engine.py` 行 225-245
- `query()`：vector + keyword + scan 多路召回后融合，再做遍历与重排。
  - 证据：`query_engine.py` 行 682-760

### C) 写入演化层：已实现双通道雏形
- `TemporalResonanceGraphMemory` 中存在 consolidation queue / pending 队列，体现快慢分离。
  - 证据：`trg_memory.py` 行 144-148
- 新 event 的 fast-path 动作：入图、入向量、temporal/semantic 初始边。
  - 证据：`trg_memory.py` 行 152-220

---

## 2. memory-lightrag 当前状态（与 MAMGA 对照）

## 2.1 已有优势（可直接承接迁移）
1. 轻量本体已经定义：`MemoryEntity/Relation/Source`。
   - 证据：`docs/memory-ontology.md`
2. 多租户/域隔离做得较完整：workspace + source tag + 审计日志。
   - 证据：`src/policy/access.ts`, `src/policy/source-tag.ts`
3. 上游 LightRAG API 已可返回 entities/relationships。
   - 证据：`docs/LIGHTRAG_API_REFERENCE.md`

## 2.2 关键缺口（影响“结构化记忆”落地）
1. **适配器只消费 chunks/references**，未透传 entities/relationships。
   - 证据：`src/adapter/lightrag.ts` 行 142-173
2. **契约与文档命名漂移**（`text` vs `content`）。
   - 证据：`docs/memory-ontology.md` vs `src/types/contracts.ts` 行 75-85
3. `memory_search` 输出仍以文本片段为主，图信息不可见。
   - 证据：`src/index.ts`（当前工具输出路径）
4. 缺少 query intent 驱动的结构化重排与遍历策略。

---

## 3. 本体映射（可迁移的“字段级”设计）

| MAMGA | memory-lightrag 当前 | 迁移建议 |
|---|---|---|
| NodeType.EVENT | 无显式 event 类型（以 chunk 文本承载） | 在 `MemoryEntity.type` 增补 `event/episode/session`（或通过 attributes.type 强约束） |
| NodeType.ENTITY | `MemoryEntity` 已有 | 保持；增加 canonical_id + alias merge 轨道 |
| LinkType.TEMPORAL | `MemoryRelationType` 无时间序关系族 | 增补 `precedes/succeeds/concurrent`（可先放 `related_to` + qualifier，后升级枚举） |
| LinkType.CAUSAL | 仅 `causes` 粗粒度 | 增补 `leads_to/enables/prevents/because_of` 或 relation qualifier |
| LinkType.ENTITY (REFERS_TO) | 可由 `mentions/about` 近似 | 建议标准化 `refers_to`，减少语义歧义 |
| SESSION/EPISODE 节点 | 无 | 先不强制建新 node type，v1 用 `entity(type=event|episode|session)` 过渡 |
| RRF 多源锚点 | 无 | 引入 `hybrid_anchor` 阶段（dense + lexical + temporal） |
| Intent-aware traversal | 无 | 引入 WHY/WHEN/WHO 轻量 router，先做权重切换，不先做复杂 beam search |
| Dual-stream evolution | 写入偏同步 | 加 async consolidation worker（可选开关） |

---

## 4. 可落地迁移方案（按收益/风险排序）

## Phase 1（2-3 天）：把“图”从后端带到前端

### 目标
不破坏现有文本返回，新增结构化图输出。

### 改造点
1. `src/adapter/lightrag.ts`
   - 解析 `data.entities` / `data.relationships`；
   - 产出 `results + graph` 双层结构。
2. `src/types/contracts.ts`
   - 统一字段命名（建议 `content` 主字段，`text` 作为兼容 alias）。
3. `src/index.ts`
   - 工具输出中加入 `details.ontology`：entityCount/relationCount/sourceCount。
4. 安全策略
   - 对 relation 的 evidence source 同步执行 `isAllowedByDomain()`。

### 验收
- 同一查询可见“文本+关系计数”；
- 老调用方零改动。

---

## Phase 2（3-5 天）：意图驱动重排（MAMGA 精髓之一）

### 目标
从“语义相似”升级到“结构对齐”。

### 改造点
1. 新增 `query-intent.ts`
   - 规则版识别 WHY/WHEN/ENTITY；
2. 新增 `rerank-policy.ts`
   - WHY：提高 causal 权重；
   - WHEN：提高 temporal 权重；
   - ENTITY：提高 entity continuity 权重；
3. 引入 RRF 融合层（dense + keyword + temporal candidates）。

### 验收
- 在 WHY/WHEN 类问题上，relation-supported answer rate 上升；
- token 使用可控（上下文更短但更“对题”）。

---

## Phase 3（1-2 周）：双流记忆演化

### 目标
写入快、结构深。

### 改造点
1. Fast path（同步）
   - 入库 chunk + 基础实体抽取 + temporal 骨架边。
2. Slow path（异步）
   - 后台做 causal/entity link 补全与去重合并；
   - 支持失败重试与可观测日志。
3. 增加 feature flag
   - `enableAsyncConsolidation` / `enableIntentRouting`。

### 验收
- P95 写入时延不劣化；
- 关系密度与可解释性提升。

---

## 5. 重点：本体论层面的“可迁移方法”

## 5.1 不建议“照抄 MAMGA schema”，建议“兼容映射”

原因：`memory-lightrag` 已有稳定工具接口与 fallback 机制，硬切 schema 代价高。

建议：
- 保留现有 `MemoryEntity/Relation/Source` 三元核心；
- 用 `relation qualifiers` 与 `entity attributes` 承接 MAMGA 扩展语义；
- 待验证后再把高频 qualifier 提升为一等枚举。

## 5.2 将“检索策略”作为本体的一部分来治理

MAMGA 的真正优势是：
- query intent 与 relation type 绑定；
- 这本质上是 **“语义层本体 + 操作层本体”协同**。

在 `memory-lightrag` 应体现为：
- ontology 不仅定义字段，还定义“什么问题偏好什么边”。

---

## 6. 风险与防线

1. **复杂度上涨**：多关系 + 异步任务会引入维护成本。
   - 防线：feature flag + 分阶段开关。
2. **跨域泄露风险**：关系边如果绕过 source 过滤会泄露。
   - 防线：relation evidence 强制走 domain policy。
3. **召回漂移**：早期 intent 分类误判可能影响答案稳定性。
   - 防线：保留 text-first fallback 与混合召回兜底。

---

## 7. 最终建议（可直接执行）

### Adopt（立刻做）
- Graph-preserving adapter
- relation-evidence 的 domain filter
- intent-aware rerank（规则版）

### Defer（拿到更多线上数据再做）
- 完整 beam-search 遍历
- 全量 episode/session 显式节点化

### Reject（当前阶段不做）
- 一步到位替换现有 text-first pipeline

---

## 8. 下一步交付（我建议）

如果你同意，我下一步可以直接产出一份 **实现级 PR 任务清单**（文件到函数级别），包括：
1. 每个文件要改什么
2. 新增类型定义草案
3. 回归测试清单（WHY/WHEN/ENTITY 三类）
4. 发布开关与回滚步骤

---

## 附：引用证据清单

### MAMGA
- arXiv HTML 抽取：`/tmp/magma/arxiv2601.03236.html`
- 代码：
  - `/tmp/magma/graph_db.py`
  - `/tmp/magma/query_engine.py`
  - `/tmp/magma/trg_memory.py`

### memory-lightrag
- `projects/memory-lightrag/docs/memory-ontology.md`
- `projects/memory-lightrag/src/types/contracts.ts`
- `projects/memory-lightrag/src/adapter/lightrag.ts`
- `projects/memory-lightrag/src/index.ts`
- `projects/memory-lightrag/src/policy/access.ts`
- `projects/memory-lightrag/src/policy/source-tag.ts`
- `projects/memory-lightrag/docs/LIGHTRAG_API_REFERENCE.md`

（已归档到 memory-lightrag 项目目录）
