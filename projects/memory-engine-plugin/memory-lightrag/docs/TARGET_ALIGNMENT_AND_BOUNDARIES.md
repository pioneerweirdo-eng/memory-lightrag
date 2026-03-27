# Step A — 目标对齐与实现边界（memory-lightrag）

Date: 2026-03-25

## 1) 目标对齐

按用户要求，项目推进顺序固定为：
- Step A：先文档对齐
- Step B：再最小实现
- Step C：最后策略化完善

核心目标：
1. 真实接入 LightRAG（写入 + 检索）
2. 个人/集体记忆隔离（workspace）
3. fallback 与可观测性（backend/fallback/reason/requestId/latencyMs）
4. 衰减策略（hot/warm/cold）
5. 可追溯与定时汇报

## 2) 固定基线与外部依赖

- LightRAG OpenAPI 基线：`http://127.0.0.1:9621/openapi.json`
- 查询优先接口：`POST /query/data`
- 写入接口：`POST /documents/text` / `POST /documents/texts`
- 健康检查：`GET /health`

## 3) 实现边界（本轮）

### In scope
- 插件内 adapter 增加写接口与 workspace header 支持
- 查询路径 workspace-aware
- 文档化验收命令与真实输出

### Out of scope（本轮不做）
- 危险硬删除（仅允许降权/归档）
- 网关无计划重启
- 未验证前的大范围架构重构

## 4) Step B 最小实现验收门槛（预定义）

1. 可写：写入 token 后，立即 `/query/data` 命中 token
2. 可隔离：同 query 在不同 workspace 返回不同语料域
3. 可回退：LightRAG 故障时返回 builtin-fallback 并带 reason
4. 可观测：details 字段完整

## 5) Step C 策略验收门槛（预定义）

1. hot/warm/cold 分层规则可执行
2. 运行一次衰减流程可给出前后对比
3. 不破坏已有检索可用性

## 6) 执行约束

- 先调研、后修改
- 每次修改有明确假设与验收命令
- 所有证据落盘到 docs/EVIDENCE_RUN_*.log 与 TRACELOG
- 禁止随意重启 gateway

---

## 7) 强制实施规则（来自审核结论，Step B 必须执行）

1. **写入侧不可伪造**
- `file_source` 只能由策略层生成；外部输入一律覆盖/忽略。
- 禁止 group 写入伪造 personal 前缀。

2. **查询可过滤字段前置校验**
- Step B 前必须确认 `/query/data` 返回包含可过滤字段（`file_source` 或等价字段）。
- 若缺失，fail-fast，不进入上线验收。

3. **shared 写权限锁定**
- 默认只有授权路径可写 shared（白名单 tool / owner）。
- group 默认不可写 shared，除非显式指令 + 审计。

4. **过滤数据不泄露**
- 被过滤掉的候选不得进入普通日志/trace。
- 审计日志仅记录拒绝事件，不记录 snippet 正文。

5. **缓存键防污染**
- 任何缓存 key 必须包含 `domain + workspace + actor/group`。

6. **过滤后立即丢弃**
- 被过滤候选不参与 rerank/冲突结构，也不持久化。

## 8) 与 OpenClaw 官方 memory 的对齐结论

依据：`/app/docs/concepts/memory.md`、`/app/extensions/memory-core/index.ts`、`/app/extensions/memory-core/openclaw.plugin.json`

- OpenClaw 官方 memory 的“真相源”是 workspace Markdown 文件（`memory/YYYY-MM-DD.md` + `MEMORY.md`）。
- memory plugin 提供 `memory_search` / `memory_get` 工具能力；active memory slot 决定具体实现。
- 当前 memory-lightrag 设计作为 memory slot 替换/增强路径，符合官方插件形态（kind=memory + tools + CLI）
- 由于单 LightRAG 实例下 workspace 强隔离边界不稳定，本方案将“强隔离责任”放在 OpenClaw 策略层，符合“文件真相源 + 工具检索”的官方理念（将安全与语义控制保持在 OpenClaw 内部）。

Status: Step A 文档已落地并纳入强制规则，Step B 按上述规则实施。
