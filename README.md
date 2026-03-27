# memory-lightrag

Memory search plugin for OpenClaw, backed by LightRAG with automatic fallback to builtin memory search.

## What this repo contains
- `src/` — plugin implementation
- [`docs/`](docs/INDEX.md) — documentation & evidence (see [Index](docs/INDEX.md))
- `eval/` — evaluation datasets/scripts
- `test/` — test and smoke plans
- `audit/` — audit logs (kept in place)

## Quick start
1. **Enable plugin** (OpenClaw config)
2. **Verify load**
   ```bash
   openclaw plugins inspect memory-lightrag --json
   ```
3. **Run a search**
   ```bash
   openclaw memory search --query "env-ops-standard" --json
   ```

## Release readiness
- See [`docs/RELEASE_READY_STATUS_2026-03-27.md`](docs/RELEASE_READY_STATUS_2026-03-27.md)
- Checklist: [`docs/RELEASE_CHECKLIST.md`](docs/RELEASE_CHECKLIST.md)
- Final alignment: [`docs/FINAL_ALIGNMENT_PACKAGE_2026-03-27.md`](docs/FINAL_ALIGNMENT_PACKAGE_2026-03-27.md)
- Evidence: [`docs/archived/`](docs/archived/GATE_SUMMARY_2026-03-27.md)

## Key reference docs
- [LightRAG API Reference](docs/LIGHTRAG_API_REFERENCE.md)
- [Memory Ontology](docs/memory-ontology.md)
- [Target Alignment & Boundaries](docs/TARGET_ALIGNMENT_AND_BOUNDARIES.md)
- [Director Route Alignment & Next Steps](docs/DIRECTOR_ROUTE_ALIGNMENT_AND_NEXT_STEPS_2026-03-27.md)
- [Observability Runbook](docs/T4_OBSERVABILITY_RUNBOOK_2026-03-26.md)

## Notes
- Gate2 evidence uses CLI deep path (`openclaw memory status --deep --json`).
- Tool payload does not expose `details` by default; see release notes for rationale.

---
Maintained by the OpenClaw memory plugin team.
