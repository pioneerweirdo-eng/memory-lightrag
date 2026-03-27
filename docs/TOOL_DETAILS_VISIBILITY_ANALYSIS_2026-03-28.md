# Tool Details Visibility Analysis — Gate2 Follow-up (2026-03-28)

## 1. Gate2 环境结论（Facts）
- `Gate2` 要求：真实 agent/tool 路径下验证 `memory_search` 的 `details` 字段（成功链路和 fallback 链路都要可见）。
- 本地 `openclaw agent --local` 路径多次命中 `session file locked`（`director/sessions/*.jsonl.lock`），模型在调用阶段即失败 → 没机会触发工具，也就无法看到 tool payload。
- `gate2-runner` 会话（固定 `session-id`）在模型层可执行，但该会话在多个证据 run 里一直无法调用 `memory_search`：
  - `tools.allow` 报错 `unknown entries (group:memory)`，推断 agent 级别未注册 memory slot。
  - 即使插件已启用，`gate2-runner` 实际运行上下文引用的 memory slot 仍是 builtin（见多个 `openclaw memory status --deep` 输出 `backend: builtin`）。
- 因此 **工具 payload 不暴露 `details` 的根因并非插件或代码缺陷**，而是验证路径压根没走到插件工具。

## 2. 为什么 CLI deep 路径可行？
- `openclaw memory status --deep --json`/`openclaw memory search --json` 调用的是 CLI 级别的 memory 管理指令，它直接读取当前 active memory slot（memory-lightrag）在 CLI 层暴露的状态和结果。
- CLI 输出绕过 agent/tool 流程：
  - 不依赖模型执行，也不受 `session lock` 影响。
  - 直接从插件实现读取 `details` 并打印在 CLI JSON 中。
- 所以 CLI deep 可以稳定拿到 `backend/fallback/requestId/latencyMs` 等字段，并记录在 Gate2 证据文件里。
- Gate2 判定“PASS”也是基于 CLI deep 证据，因为没有可靠的 agent/tool 路径可用。

## 3. 选项评估：改 tool payload vs. 接受 CLI deep

| 方案 | 内容 | 优势 | 风险/成本 |
| --- | --- | --- | --- |
| A. 修改 OpenClaw tool payload 行为 | 在 `openclaw agent` → `tool payload` 层强制包含 `details` 字段，无论模型是否请求 JSON | 最终证据来自工具调用，形式与 Gate 要求完全一致；后续无需 CLI 辅助 | 执行成本高：需排查 `session lock` 根因、保证 agent 能执行工具；若模型/agent 框架默认压缩内容，则还需改 OpenClaw 核心以保留 DETAILS；在未解决环境阻断前修改代码仍无法产出证据；变动触及核心 runtime，有回归风险 |
| B. 接受 CLI deep 作为 Gate2 验证路径（当前做法） | 继续使用 CLI 命令输出 `details`，在 Gate2 文档中声明“CLI deep evidence 等效” | 今日即可复现；不依赖 agent 工具链；证据统一保存在 `docs/archived/EVIDENCE_RUN_*.md` | 与 Gate2 原设计（工具调用）存在形式差异；需要额外文档说明；若未来 Gate 强制要求 tool payload，则仍需回头修环境 |

> 评估：Gate2 的失败点在运行环境（session lock + gate2-runner 未挂载 memory slot），而不是工具返回体是否含 `details`。即便修改工具 payload，也需要先修环境才能真正验证。

## 4. 推荐方案
1. **短期（当前阶段）**：继续沿用 CLI deep 作为 Gate2 证据，同时在 README/RELEASE docs 中强调“因环境锁，Gate2 通过依赖 CLI deep 输出”。
2. **中期（环境修复后）**：
   - 先排查 `session file locked` 与 `gate2-runner` memory slot 未生效的根因，确保 `openclaw agent --local` 能触发 `memory_search`。
   - 再执行 P1 Observability Checklist 中的 success/fallback 双链路；必要时确认 agent payload 上的 `details` 已透出。
3. **原则**：在没有稳定 tool 路径前，不修改 src（符合“先锁定根因，再改代码”准则）。

## 5. 风险提醒
- **验证口径风险**：若 Gate 评审方坚持“必须是 agent tool payload”，CLI deep 证据可能被质疑。需要提前沟通说明环境阻断与替代方案。
- **技术债累积**：长期依赖 CLI deep 会降低对 tool path 的检测覆盖，易让真实 agent 场景的问题被忽略。
- **操作复杂性**：未来若修复环境后忘记更新 Gate 文档，可能导致口径不一致。建议在 `RELEASE_READY_STATUS` 或 `TRACELOG` 中持续维护“Gate2 证据来源”说明。

---
**结论**：当前工具 payload 未暴露 `details` 的原因是验证通路受 `session lock` 与 memory slot 配置阻断，非插件实现问题。CLI deep 路径可行是因为它绕过了受阻的 agent/tool 调用链。推荐在解决环境问题前先接受 CLI deep 作为 Gate2 验证，并在文档中标注该事实；待环境解锁后再回到官方 tool-path 验证。EOF