# Milestone 1 Kickoff — memory-lightrag (v1)

## Objective
启动 v1 插件骨架推进，只做最小可用路径：**status + search + fallback**。

## In Scope (v1)
1. `memory-lightrag` 插件清单与目录结构
2. 配置读取与校验（baseUrl/apiKey/topK/budget）
3. `memory status` 探活（后端连通 + 配置健康）
4. `memory search` 适配器（请求 LightRAG，返回受控摘要）
5. fallback 规则（后端异常时回落 memory-core）

## Out of Scope (v1)
- auto-capture
- consolidation
- decay
- 复杂 rerank / graph pipeline

## Implementation Order
1. 插件骨架与 manifest
2. status 命令
3. search 命令
4. 错误语义与 fallback
5. smoke test 脚本

## Acceptance Criteria
- `openclaw memory status` 返回健康状态
- `openclaw memory search "..."` 返回结果且含来源信息
- 后端不可用时返回可诊断错误并可降级
- 关键路径日志可读、可审计

## Validation Plan
- Case A: LightRAG 在线 -> status/search 成功
- Case B: LightRAG 离线 -> status 失败且给出 fallback 提示
- Case C: 非法配置 -> 启动期即报清晰错误

## Risk Guardrail
- 任何导致会话主链路不稳定的改动必须回滚
- v1 不引入后台自动写入，防止噪音和不可控副作用
