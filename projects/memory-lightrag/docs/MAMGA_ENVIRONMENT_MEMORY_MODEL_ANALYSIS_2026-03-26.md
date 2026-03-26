# MAMGAUser/Environment × memory-lightrag 记忆建模分析报告（阶段版）

- 日期：2026-03-26 (UTC)
- 执行人：health-manager
- 目标：分析 `MAMGAUser/Environment` 项目及其论文中的 memory 建模方式，并提炼可迁移到 `memory-lightrag`（重点本体论）的方案。
- 结论状态：**阶段版（受外部源获取限制）**

---

## 1) Scope & Constraints（范围与约束）

### 本次实际完成范围
1. 对 `memory-lightrag` 的本体/检索/隔离策略进行代码级审查。
2. 建立“外部项目方法 → 本项目可迁移位点”的映射框架。
3. 给出可落地的 Adopt/Defer/Reject 设计决策与分阶段实施方案。

### 关键约束（必须透明披露）
- 当前环境中无法可靠拉取 `MAMGAUser/Environment` 仓库与对应论文正文（表现为：仓库不可达/不存在、GitHub API 限流、内置 web 工具受限）。
- 因此本报告对 MAMGA 的部分采用：
  - **已验证事实**：无法获取源码与论文原文；
  - **待验证项**：其 memory schema 与训练/检索流程细节；
  - **可先行动作**：先把我们侧可迁移“接口骨架”建好，待拿到原文后快速填充。

> 这不是“泛泛而谈”规避，而是把“证据缺口”当成一等对象，先做可逆架构决策，避免盲目重构。

---

## 2) Evidence Table（证据表）

| 来源 | 关键观察 | 置信度 |
|---|---|---|
| `docs/memory-ontology.md` L5-10, 16-204 | 已定义 v1 轻量本体：Entity/Relation/Source + 结构化 `MemorySearchItem`，强调“兼容 text-first fallback”。 | 高 |
| `src/types/contracts.ts` L18-112 | 代码契约已含 ontology 类型；但搜索返回中主字段是 `content/source`（而非文档中 `text/sources-first` 命名），存在“文档-实现命名漂移”。 | 高 |
| `src/adapter/lightrag.ts` L104-173 | 适配层调用 `/query/data`，但当前仅消费 `chunks/references`，**未把 `entities/relationships` 映射到返回结果**。 | 高 |
| `src/index.ts` L124-152 | `memory_search` 最终输出仍是文本片段（Path+content），ontology 字段在工具输出中被“降格”为不可见内部能力。 | 高 |
| `src/policy/domain-routing.ts` + `src/policy/access.ts` + `src/policy/source-tag.ts` | 已有 domain/workspace/source 前缀隔离（u__/g__/s__），并有 deny 审计日志，是可复用的“记忆安全边界”。 | 高 |
| `docs/LIGHTRAG_API_REFERENCE.md` L141+ | `/query/data` 原生可返回实体/关系/块/引用，说明上游已具备图谱数据，不是后端能力不足。 | 高 |
| 外部拉取尝试（GitHub/API/web） | 未能获取 `MAMGAUser/Environment` 与论文原文（API 限流/路径不存在/网络策略限制）。 | 高（对“无法获取”这一事实） |
| MAMGA memory 具体结构 | 无法在当前会话验证（需仓库 URL、论文 PDF/标题）。 | 低 |

---

## 3) Option Matrix（Adopt / Defer / Reject）

### A. 本体与检索接口层

1. **Adopt：双层结果模型（RawGraph + RecallView）**
   - 含义：保留上游完整图结构（entities/relations/chunks/references）作为 `raw`，再投影成前台可用 `recall items`。
   - 原因：当前只留 chunks 会丢失关系信息，无法支持“记忆推理链路”。
   - 落点：`src/adapter/lightrag.ts` + `src/types/contracts.ts`。

2. **Adopt：实体稳定 ID + same_as 合并轨道**
   - 含义：在入库与检索环节维持实体稳定标识，加入别名归一策略。
   - 原因：`memory-ontology.md` 已定义 `same_as`，但尚未落到检索结果与后处理。

3. **Defer：高阶时序本体（episode timeline / temporal constraints）**
   - 原因：目前基础关系层尚未打通，先做实体关系可见化更划算。

4. **Reject（当前阶段）：端到端“全图替换文本召回”**
   - 原因：风险高，且现有系统依赖 text-first fallback 作为可靠兜底。

### B. 安全与多租户

1. **Adopt：将 domain/source policy 前置到图数据层**
   - 含义：对 entities/relations 的证据来源也执行 `isAllowedByDomain`。
   - 原因：当前过滤主要作用于 chunk/source 文本，图关系也可能跨域泄露。

2. **Defer：跨域共享本体（global ontology federation）**
   - 原因：需要先定义严格授权和撤销语义，否则共享关系会变成隐式泄露面。

### C. 与“外部项目方法”对齐方式（在源未到位时的可逆方案）

1. **Adopt：先做“可插拔映射层”再对齐外部 schema**
   - 落点：新增 `mapper/<external>/to-memory-ontology.ts`；
   - 好处：拿到 MAMGA 源后只改 mapping，不动核心 API。

2. **Reject：提前按猜测重构核心存储**
   - 原因：证据不足，容易重构错误并放大回滚成本。

---

## 4) Architecture Decision（单一路径推荐）

**推荐路径：`Graph-preserving, Text-compatible`（保图兼文）**

### 决策内容
- 保持 `memory_search` 的文本返回兼容性不变（避免破坏现有 agent 行为）。
- 在同一响应中新增结构化扩展（entities/relations/sources/provenance），并保证 domain 过滤后再输出。
- 适配器严格消费 `/query/data` 的完整结构，而非只取 chunks。

### 为什么是这条路
1. 与现有 `memory-ontology` 文档目标一致（结构化回忆 + 兼容回退）。
2. 与当前代码差距最小，可渐进上线。
3. 对将来接入 MAMGA（或其他论文方案）的“迁移摩擦”最低。

---

## 5) Phased Plan（v1 / v2 / v3）

## v1（1-2 天）：把图数据“带出来”

### 目标
在不破坏现有 `content` 输出的前提下，让 `memory_search` 结果附带结构化本体字段。

### 任务
1. `src/adapter/lightrag.ts`
   - 解析 `data.entities` 与 `data.relationships`。
   - 生成统一中间结构：`rawGraph` + `recallItems`。
2. `src/types/contracts.ts`
   - 对齐文档命名（建议 `content` 与 `text` 二选一，提供向后兼容 alias）。
3. `src/index.ts`
   - 工具返回新增 `details.ontology`（或 `details.graph`）计数信息：entityCount/relationCount/sourceCount。
4. 过滤策略
   - 对关系证据来源执行 domain 过滤（非仅文本片段）。

### 验收
- 查询响应可见实体/关系计数；
- 老调用方不改代码也可继续工作。

## v2（3-5 天）：实体归一与冲突处理

### 目标
让“同一实体多叫法”不再撕裂记忆。

### 任务
1. 增加 `same_as` 合并策略：name+alias+source evidence。
2. 冲突显式化：同名异实体输出 `confidence/conflict_flag`。
3. 追踪 provenance：关系必须可回指 source。

### 验收
- Top 20 高频实体去重率提升；
- 冲突样例可审计。

## v3（1-2 周）：面向外部方法（含 MAMGA）对齐

### 目标
引入“外部 schema 适配层”，实现低风险迁移。

### 任务
1. 建立 `external-memory-mapper` 接口（输入外部结构，输出标准本体）。
2. 为 MAMGA 仓库/论文定义专用 mapping（待获得原文后实现）。
3. 做 A/B：text-only vs graph-aware recall 对比。

### 验收
- 同一问题回答中可引用关系证据链；
- Recall 准确率与可解释性提升可量化。

---

## 6) Risks / Rollback / Metrics（风险、回滚与指标）

## 主要风险
1. **证据缺口风险**：MAMGA 细节未取到，过早“拟合”会误导设计。
2. **兼容性风险**：字段命名变更可能影响旧 prompt/tooling。
3. **安全风险**：图关系若未过滤可能出现跨域泄露。

## 回滚策略
1. 保留 `fallbackEnabled=true` 路径（已有）。
2. 新增结构字段均为 additive，不替换现有 `content` 主字段。
3. 通过 feature flag 控制 ontology 输出开关（建议新增 `enableOntologyOutput`）。

## 度量指标（上线后必须看）
1. Recall 质量：
   - entity hit rate
   - relation-supported answer rate
2. 安全：
   - domain filter dropped ratio
   - 跨域误召回事件数
3. 稳定性：
   - fallback ratio
   - p95 latency

---

## 针对“可借鉴 + 可迁移”的结论（当前可执行版）

1. **先迁移“结构承载能力”，再迁移“具体外部语义”**：
   先把我们的 adapter/output 变成真正 graph-aware，再对接 MAMGA 细节，成本最低。
2. **把安全策略提升为本体级约束**：
   现在的 domain/source 机制已经很好，应从 chunk 扩展到 entity/relation 证据链。
3. **坚持可逆演进**：
   任何升级都不替代 text-first fallback；以 additive schema + feature flag 推进。

---

## 缺失输入清单（用于生成最终定稿版）

为完成“对 MAMGA 项目与论文的精准对比”，还需要以下任一项：
1. `MAMGAUser/Environment` 的可访问仓库链接（或压缩包）；
2. 对应论文标题/DOI/arXiv 链接/PDF；
3. 若仓库私有，请提供 README + memory 相关模块路径。

拿到后可在本报告基础上 1 次迭代输出**定稿版（含逐段对照、字段级映射表、迁移 PR checklist）**。

---

## 附：本次引用文件
- `projects/memory-lightrag/docs/memory-ontology.md`
- `projects/memory-lightrag/src/types/contracts.ts`
- `projects/memory-lightrag/src/adapter/lightrag.ts`
- `projects/memory-lightrag/src/index.ts`
- `projects/memory-lightrag/src/policy/domain-routing.ts`
- `projects/memory-lightrag/src/policy/source-tag.ts`
- `projects/memory-lightrag/src/policy/access.ts`
- `projects/memory-lightrag/docs/LIGHTRAG_API_REFERENCE.md`

（已归档到 memory-lightrag 项目目录）
