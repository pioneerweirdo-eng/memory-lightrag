# Dataset Repair + LightRAG Feature Audit (Code-Level)

Date: 2026-03-26
Project: `projects/memory-lightrag`
Context: T5.1-R2 pre-promotion hardening

## 0) 术语与时间口径（消除历史偏差歧义）

- **[AS-IS] 当前事实**：基于 2026-03-26 当天代码与数据快照的已观察状态。
- **[HISTORICAL] 历史口径**：仅用于解释过去评测结论如何产生，不作为当前发布依据。
- **[PLAN] 规划项**：尚未落地的改造任务，不应被误读为已完成。

> 本文所有结论默认按以上标签理解；未标注时，按 **[AS-IS]** 处理。

## 1) Scope & constraints

### Scope
1. 审核当前 intent 评测数据集是否覆盖真实场景、是否可抗“刷分”。
2. 代码级审计 LightRAG 功能使用范围（已用/未用/可迁移）。
3. 给出“先修复数据集，再推进策略”的可执行路线。

### Constraints
- 不破坏现有 `memory_search` 接口兼容性。
- 评测改造优先“可审计、可复现、可对比”，而非追求短期高分。
- 不引入高成本在线模型判类（先保持 deterministic 路径）。

---

## 2) Evidence table

| Source | Claim | Time tag | Confidence |
|---|---|---|---|
| `eval/intent_replay_dataset_2026-03-26.json` | 数据集为自建样本（120），非公开标准基准；标签结构 `id/query/expected_intent`。 | [AS-IS] | High |
| `eval/intent_calibration_dataset_2026-03-26.json` | 校准集仅 24 条，体量偏小，易受模板影响。 | [AS-IS] | High |
| `eval/run-intent-replay-eval.mjs` | T4 baseline 规则内嵌在同 runner，可被同文件改动影响基线对比。 | [AS-IS] | High |
| `src/policy/query-intent.ts` + `intent-features.ts` + `intent-scorer.ts` | 已做 deterministic scored routing，但阈值是硬编码；详细决策原因字段不完整。 | [AS-IS] | High |
| `docs/LIGHTRAG_API_REFERENCE.md` | LightRAG 支持 `/query`, `/query/stream`, `/query/data`, `enable_rerank`, `chunk_top_k`, mode 等。 | [AS-IS] | High |
| `src/adapter/lightrag.ts` | 当前只调用 `/query/data`，固定 `mode:"mix"`, `top_k:8`, `include_chunk_content:true`；未显式传 `enable_rerank/chunk_top_k`。 | [AS-IS] | High |

---

## 3) Option matrix (Adopt / Defer / Reject)

### A. 数据集修复

1. **Adopt: 三层评测集治理**
   - L1：开发回归集（可见标签）
   - L2：盲测 holdout（标签隔离）
   - L3：外部基准映射子集（LoCoMo/LongMemEval 意图映射）

2. **Adopt: 基线不可变机制**
   - baseline detector 独立文件 + hash 固定 + CI 检查

3. **Defer: 全自动标签生成**
   - 先人工审核少量高价值样本，防止自动标注漂移

4. **Reject: 继续仅用单一自建回放集做发布门槛**
   - 证据不足、易被 prompt 风格污染

### B. LightRAG 功能使用

1. **Adopt: 参数化接入（而非硬编码）**
   - expose `mode/top_k/chunk_top_k/enable_rerank/include_chunk_content`

2. **Adopt: 双路径实验**
   - `/query/data`（结构化）为主
   - `/query`（答案文本）作为对照路径

3. **Defer: `/query/stream` 在线接入**
   - 可在后续交互优化阶段做，不影响当前意图评测

4. **Reject: 盲目开启所有高级参数**
   - 无指标回归就直接开会放大不可控噪声

---

## 4) Architecture decision (single recommended path)

**Decision:** 先做“评测基建标准化”，再做 LightRAG 参数化能力扩展。

### Why
- 当前最大风险不是模型能力，而是评测口径可信度。
- 若数据集与 baseline 不可审计，任何提升都不可靠。
- LightRAG 的高级能力（rerank/chunk_top_k/mode）应在稳定评测框架下逐项验证。

---

## 5) Phased plan (v1/v2/v3)

## v1（本周）：数据集修复与审计闭环

### 任务
1. 拆分数据集：
   - `eval/datasets/dev_visible.json`
   - `eval/datasets/holdout_blind_inputs.json`
   - `eval/datasets/holdout_labels.json`（隔离，不给策略开发流程）
2. baseline 固化：
   - `eval/baselines/t4_detector_frozen.mjs`
   - 记录 hash 与基线 commit
3. 报告模板统一：
   - 每次评测输出 `dataset_hashes + baseline_hash + runner_hash`

### 验收
- 能复现同一结果（hash 一致）
- baseline 文件改动触发 CI 失败

## v2（下周）：LightRAG 功能参数化与A/B

### 任务
1. 在 `src/adapter/lightrag.ts` 增加可配参数：
   - `mode`, `top_k`, `chunk_top_k`, `enable_rerank`, `include_chunk_content`
2. 做 A/B：
   - A: 当前固定参数
   - B: 开启 rerank + 调整 chunk_top_k
3. 输出按 intent 分桶指标（WHY/WHEN/ENTITY/GENERAL）

### 验收
- 至少 2 组参数对比报告
- 无回归才进入默认策略候选

## v3（后续）：外部标准对齐

### 任务
1. 从 LoCoMo/LongMemEval 构造 intent-compatible 子集
2. 标注协议（双人复核 + 分歧仲裁）
3. 合并为发布门槛：L1 + L2 + L3 全过

### 验收
- 三层门槛稳定通过 2 次连续迭代

---

## 6) Risks, rollback, metrics

## Risks
1. 数据治理初期成本上升（标注/维护）
2. 参数化 LightRAG 增加实验维度，短期结果波动
3. 盲测集如果泄漏，会失去防刷作用

## Rollback
- 保留当前评测脚本作为 legacy 路径，新增 `--strict-audit` 模式；
- 新参数默认关闭，feature flag 控制。

## Metrics（新增发布硬门槛）
1. 评测可信度指标：
   - hash completeness = 100%
   - baseline immutability checks pass
2. 业务指标：
   - GENERAL recall（holdout）
   - overall accuracy（holdout）
   - confusion top edges（GENERAL->WHEN / GENERAL->ENTITY）
3. 稳定性指标：
   - 两轮迭代指标波动 < 2pp

---

## LightRAG 功能使用现状（明确答复）

### 已用
- `POST /query/data`
- `mode: "mix"`
- `top_k: 8`
- `include_references: true`
- `include_chunk_content: true`
- 结构化返回映射：entities/relationships/chunks/references

### 未充分使用（当前缺口）
- `enable_rerank`（未显式传入）
- `chunk_top_k`（未显式调参）
- `/query` 与 `/query/stream` 作为对照/在线路径
- metadata.processing_info 的系统化利用

### 结论
- LightRAG 的“强功能”目前**只用到了部分**，尤其是重排序与参数化实验能力还没真正纳入 A/B 验证。

---

## Next action (immediate)

先执行 v1：
1. 修复并分层数据集（含盲测隔离）
2. 冻结 baseline 检测器与 hash 审计
3. 输出第一版“防刷发布评测报告”

再进入 v2 做 LightRAG 参数化实验。
