## [ERR-20260311-001] openclaw-cron-add-at-duration-format

**Logged**: 2026-03-11T05:48:30Z
**Priority**: medium
**Status**: pending
**Area**: tooling

### Summary
`openclaw cron add --at +1m` fails; duration format must not include `+`.

### Error
```
Error: Invalid --at; use ISO time or duration like 20m
```

### Context
- Attempted: `openclaw cron add --at +1m ...`
- `openclaw cron add --help` indicates durations like `20m`.

### Suggested Fix
Use `--at 1m` (no leading plus), or use `--every 1m` for repeating jobs.

### Metadata
- Reproducible: yes
- Related Files: projects/graphrag/tools/clean_batch_with_cron.md
- Tags: openclaw, cron, cli
---
