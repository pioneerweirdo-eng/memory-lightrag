# IMPLEMENTATION PLAN - memory-lightrag

## Milestone 0（已完成）
- [x] 拉取 LightRAG 源码到 `workspace/projects/LightRAG`
- [x] 核对 OpenClaw memory 插件入口与 manifest 规范
- [x] 明确 `plugins.slots.memory` 激活路径

## Milestone 1（本轮）
- [ ] 初始化插件目录（`openclaw.plugin.json` + `package.json` + `index.ts`）
- [ ] 提供 `memory status` 探活与错误语义
- [ ] 提供 `memory_search`（LightRAG adapter）
- [ ] 本地 smoke test（status/search）

## Milestone 2
- [ ] auto-capture + after-turn 批量 upsert
- [ ] 注入防护与输入清洗
- [ ] top-k + token budget 截断策略

## Milestone 3
- [ ] consolidation + decay
- [ ] 指标输出（recall_hit, miss, token_cost）
- [ ] 回归测试与文档

## 验收标准
1. `openclaw memory status` 能返回插件可用状态。
2. `openclaw memory search "..."` 能命中 LightRAG 检索结果。
3. 关闭插件时可平滑回退默认 memory 插件。
