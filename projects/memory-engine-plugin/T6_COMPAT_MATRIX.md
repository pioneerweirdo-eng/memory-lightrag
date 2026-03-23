# T6_COMPAT_MATRIX — memory-lightrag vs memory-core 能力差距清单（v1）

## Purpose
对比 `memory-lightrag` 与 `memory-core` 的可交付能力差距，给出可执行补齐优先级（P0/P1/P2）。

## Compared Targets
- `memory-core`（当前稳定基线）
- `memory-lightrag`（目标插件）

---

## A. 总览矩阵（能力/状态/优先级）

| 能力项 | memory-core | memory-lightrag 当前设计 | 差距结论 | 优先级 |
|---|---|---|---|---|
| `kind: "memory"` + slot 接管 | ✅ | ✅ | 无差距 | — |
| `memory status` 健康探测 | 基础可用 | 已设计（`GET /health` 为主） | 需落实现与错误分级 | P0 |
| `memory search` 基础文本召回 | ✅（文本导向） | ✅（`/query/data` + `/query` 回退） | 需落实现与兼容测试 | P0 |
| 结构化 recall（entity/relation/source） | ❌ | ✅（ontology + typed contract） | **lightrag 具备新增优势**，需保证回退兼容 | P0 |
| 类型化错误分类（AUTH/TIMEOUT/5XX） | 较弱/不统一 | 已设计 typed taxonomy | 需落实现并接入日志 | P0 |
| 可观测字段（endpoint/latency/errorType） | 基础 | 已设计更细粒度 | 需落地统一日志格式 | P1 |
| fallback 指令化输出（非静默） | 多为人工判断 | 已设计 `fallback=true + actionHint` | 需实现并验证 CLI 输出一致性 | P1 |
| 端点别名兼容策略 | 基础 | 已定义 profile | 需验证本地 LightRAG 实际端点 | P1 |
| 自动捕获/衰减/合并 | 基础或无 | v1 明确不做 | 非阻塞差距（后续增强） | P2 |

---

## B. 关键差距详情（可执行）

### Gap-01：`status/search` 仍是文档契约，尚未形成稳定实现证据
- 现状：契约文档已齐（adapter/profile/ontology），但实现与QA证据未闭环。
- 影响：上线风险集中在“文档正确但行为漂移”。
- 补齐动作：
  1. 实现 `checkHealth()` 与 `search()`；
  2. 通过 `memory status` / `memory search` CLI 实测；
  3. 记录通过样例与失败样例。
- 优先级：**P0**。

### Gap-02：结构化结果与文本兼容需要强约束验证
- 现状：ontology 已定义 `MemoryEntity/Relation/Source`，但尚未验证“无结构数据时”回退质量。
- 影响：可能出现结构字段为空导致上层误判。
- 补齐动作：
  1. 对 `/query/data` 返回完整结构时，断言 typed 输出字段完整；
  2. 对 `/query` 或弱结构返回时，断言 `text` 仍可用且 `sources` 至少可合成；
  3. 对空结果保持 `items: []`（非异常）。
- 优先级：**P0**。

### Gap-03：错误分类与运维动作尚未端到端打通
- 现状：错误 taxonomy 完整，但需验证 HTTP/网络异常到 `reason/actionHint` 的映射一致性。
- 影响：故障时难以快速决策（重试/回退/切槽）。
- 补齐动作：
  1. 构造 400/401/403/429/5xx/timeout 场景；
  2. 校验 error type、retryable、fallback reason、actionHint；
  3. 将日志字段纳入固定格式。
- 优先级：**P0**。

### Gap-04：可观测字段尚未沉淀到统一 runbook
- 现状：设计有字段，尚未形成标准检索命令与判读模板。
- 影响：排障成本高，难复盘。
- 补齐动作：
  1. 固化日志字段与样例；
  2. 输出最小 runbook（status/search 各1条排障路径）。
- 优先级：**P1**。

### Gap-05：高级能力（auto-capture/graph rerank）尚未纳入 v1
- 现状：刻意 defer。
- 影响：不是上线阻塞。
- 补齐动作：v1 稳定后进入 v2 评估。
- 优先级：**P2**。

---

## C. Go/No-Go（相对 memory-core 切换门槛）

### Go 条件（全部满足）
- [ ] `memory status`：健康、降级、鉴权失败均有稳定输出
- [ ] `memory search`：`/query/data` 主路径可用，`/query` 回退可用
- [ ] typed recall 字段在有结构数据时完整，在无结构数据时不破坏文本可用性
- [ ] typed error -> fallback reason/actionHint 映射通过
- [ ] 关键日志字段可检索（operation/resolvedEndpoint/latency/errorType/resultCount）

### No-Go 条件（任一命中）
- [ ] status/search 任一主流程不可复现
- [ ] 结构化字段缺失导致搜索不可用
- [ ] 错误分类与实际 HTTP/网络异常不一致
- [ ] fallback 静默发生（无 reason/actionHint）

---

## D. 最小补齐路线（建议）
1. 先完成 P0（实现 + 端到端验证 + 错误映射测试）。
2. 再做 P1（观测与runbook）。
3. 最后评估 P2 增强项（不阻塞切换）。
