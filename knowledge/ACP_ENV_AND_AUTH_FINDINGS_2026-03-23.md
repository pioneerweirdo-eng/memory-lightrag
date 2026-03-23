# ACP 环境变量与鉴权排障调研（2026-03-23）

## 背景问题
- 现象：`sessions_spawn(runtime="acp", agentId="codex")` 经常 `acpx exited with code 1`。
- 关注点：`.env` 里的 `DAIJU_API_KEY` 为什么 ACP 路径读不到？

## 文档与源码证据

### 1) OpenClaw 官方 ACP 文档（本地）
- `/app/docs/tools/acp-agents.md`
- 结论：`/acp model <id>` 只映射 runtime 的 model 选项，不负责 baseUrl/key 注入。

### 2) OpenClaw acpx 插件源码
- 文件：`/app/extensions/acpx/src/config.ts`
- 关键逻辑：`command === ACPX_BUNDLED_BIN` 时，`stripProviderAuthEnvVars = true`
- 含义：使用 bundled acpx 时，子进程会剥离已知 provider 认证变量（安全策略）。

- 文件：`/app/extensions/acpx/src/runtime-internals/process.ts`
- 关键逻辑：spawn 子进程时可按 `stripProviderAuthEnvVars` 选择是否剥离 provider env。

### 3) acpx 代理命令执行方式（实测）
- `~/.acpx/config.json` 中 `agents.codex.command` 不是 shell 展开语义。
- `env OPENAI_API_KEY=${DAIJU_API_KEY} ...` 会把 `${DAIJU_API_KEY}` 当字面量，不会自动展开。

## GitHub issue 调研（网页抓取）

### A. openclaw/openclaw#51909
- 链接：`https://github.com/openclaw/openclaw/issues/51909`
- 标题：acpx gateway runtime fails with `exited with code 1` while direct acpx works。
- 相关点：issue 讨论直接指向 gateway 路径与 env/auth 处理差异（含 `stripProviderAuthEnvVars` 讨论）。

### B. openclaw/openclaw#51654
- 链接：`https://github.com/openclaw/openclaw/issues/51654`
- 标题：Support session-level environment variables for ACP sessions。
- 结论：当前 ACP spawn 缺乏会话级 env 注入能力是已知需求。

### C. zed-industries/codex-acp#34
- 链接：`https://github.com/zed-industries/codex-acp/issues/34`
- 主题：第三方 provider / env 透传兼容问题。
- 进展：维护者提到修复（关联 PR #81）后支持第三方 provider 路径改进。

## 对本机问题的归因
1. `.env` 文件存在 ≠ ACP 子进程必然拿到该变量。
2. 若走 bundled acpx，provider auth env 可能被剥离。
3. `~/.acpx/config.json` 中 `${VAR}` 不会自动展开，导致 key 可能是字面量。
4. 结果是 codex-acp 调用 `/responses` 时出现 401/鉴权失败。

## 与“昨天成功”的关系
- 昨天成功记录对应 `acpx openclaw exec` 路径（桥接会话链路），不是当前 `codex-acp /responses` 这条鉴权链路。
- 两条路径成功条件不同，不矛盾。

## 官方做法下的可执行修复顺序（建议）
1. 先确保 gateway 进程环境中有真实 `DAIJU_API_KEY`（不是只在某个文件里声明）。
2. 避免在 `agents.codex.command` 里写 `${VAR}` 期望展开。
3. 若需保留 provider key 到子进程，优先使用非 bundled 明确 command（避免默认 strip）并复测。
4. 每次复测固定输出：请求 URL + HTTP 状态 + 错误摘要。
