# TOOLS.md - Local Operator Cheat Sheet

Purpose: fast, **repeatable** operations for this workspace.

> Keep this file practical. If a note can save 5+ minutes in incident handling, put it here.

---

## 1) Workspace & Paths

- Main workspace: `/home/node/.openclaw/workspace/agents/director`
- OpenClaw global config: `/home/node/.openclaw/openclaw.json`
- ACP extension path: `/app/extensions/acpx`
- ACP binary used by runtime: `/app/extensions/acpx/node_modules/.bin/acpx`
- Codex ACP stream logs:
  - `/home/node/.openclaw/agents/codex/sessions/*.acp-stream.jsonl`

---

## 2) High-Value Commands (copy/paste)

### OpenClaw basic health

```bash
openclaw status
```

### Check acpx version actually installed

```bash
/app/extensions/acpx/node_modules/.bin/acpx --version
```

### ACP codex smoke test

```bash
cd /home/node/.openclaw/workspace/agents/director
/app/extensions/acpx/node_modules/.bin/acpx --verbose --format quiet --timeout 120 codex exec "Reply with ACP_OK only"
```

### Inspect latest codex ACP stream events

```bash
tail -n 120 /home/node/.openclaw/agents/codex/sessions/*.acp-stream.jsonl
```

---

## 3) ACP / Codex Known Pitfalls (important)

### Official-first rule (must follow)
Before changing ACP/Codex/Claude behavior, read these docs first (no guesswork):
- `/app/docs/cli/acp.md` (ACP bridge + acpx openclaw usage)
- `/app/docs/providers/openai.md` (OpenAI / openai-codex official setup)
- `/app/extensions/acpx/skills/acp-router/SKILL.md` (runtime routing rules in this repo)

Hard constraint from docs:
- OpenClaw model providers (`openclaw.json -> models.providers`) and ACP harness adapters are **different layers**.
- `acpx codex/claude` uses adapter commands (e.g., `@zed-industries/codex-acp`, `@zed-industries/claude-agent-acp`), not OpenClaw provider aliases directly.
- Therefore: do not treat provider model availability as ACP harness compatibility proof.

Compatibility gate (official workflow):
1. Verify pinned local `acpx` binary works.
2. Run ACP smoke test.
3. Only on pass: spawn ACP coding-agent.
4. On fail: report URL + HTTP status + root cause; switch fallback path.


### Model/endpoint selection rule (hard requirement)
- Do **not** assume any public endpoint/model is usable for codex-acp.
- Before any ACP coding task, run a 30s smoke test first; only use the route that passes.
- If smoke fails, do not spawn coding-agent blindly; report failure reason and switch to fallback execution path.

Smoke template:
```bash
cd /home/node/.openclaw/workspace/agents/director
/app/extensions/acpx/node_modules/.bin/acpx --verbose --format quiet --timeout 30 codex exec "Reply with ACP_OK only"
```

Decision:
- Pass => use ACP runtime.
- Fail with 404/401/etc => no ACP spawn; return root cause + fallback.


### Symptom A
- `codex run failed: acpx exited with code 1`
- no agent output / stalled 60s

### Root causes seen locally
1. `OPENAI_BASE_URL=https://api.siliconflow.cn/v1` → codex-acp hits `/responses` on SiliconFlow and gets **404**.
2. Unsetting base URL falls back to OpenAI, but local `OPENAI_API_KEY` may be invalid for OpenAI → **401**.
3. Switching to other proxy URL without matching key → **401 Invalid API key**.

### Quick diagnosis
- Run verbose acpx test and read exact upstream URL/status in stderr.
- Confirm env presence (mask secrets):

```bash
node -e "for (const k of ['OPENAI_BASE_URL','OPENAI_API_KEY','CODEX_PROXY_URL','CODEX_PROXY_KEY','SILICONFLOW_API_KEY']) console.log(k, process.env[k]?'<set>':'<unset>')"
```

### Rule
- When ACP fails, **report exact URL + HTTP code + one-line root cause** before proposing fixes.

---

## 4) memory-lightrag Local Notes

### Current plugin signal
- Warning may appear:
  - `memory-lightrag: loaded without install/load-path provenance`
- Treat as **trust/provenance warning**, not immediate runtime failure.

### Relevant project docs
- `projects/memory-engine-plugin/memory-lightrag/docs/memory-ontology.md`
- `projects/memory-engine-plugin/memory-lightrag/docs/LIGHTRAG_API_REFERENCE.md`
- `projects/memory-engine-plugin/T6_ADAPTER_TASK.md`
- `projects/memory-engine-plugin/T6_ENDPOINT_PROFILE.md`
- `projects/memory-engine-plugin/T6_COMPAT_MATRIX.md`

### Source trees available locally
- `/home/node/.openclaw/workspace/projects/LightRAG`
- `/home/node/.openclaw/workspace/projects/graphrag/LightRAG`

---

## 5) Execution Style Reminders (from user preference)

- For **clear single-point issues**: do the minimal direct fix first; don’t over-design generic plans.
- For uncertain incidents: evidence first, then action.
- Prefer one-variable-at-a-time changes.
- Always leave a trace: what changed, why, evidence, rollback path.

---

## 6) Change Log

- 2026-03-23: upgraded TOOLS.md from template to operational runbook (ACP diagnostics + memory-lightrag notes + command snippets).
