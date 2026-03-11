# Run Markdown cleaning via OpenClaw cron (isolated, Llama 8B)

This job will:
- Read: `projects/graphrag/docs/papers_md/*.md`
- Write: `projects/graphrag/docs/papers_clean/*.md`

## 1) Create output dir (one-time)
```bash
mkdir -p projects/graphrag/docs/papers_clean
```

## 2) Add one-shot cron job
```bash
openclaw cron add \
  --name "graphrag-md-clean-llama8b" \
  --at +1m \
  --session isolated \
  --model "Llama 8B" \
  --timeout-seconds 1800 \
  --message "Clean markdown files. For each file under projects/graphrag/docs/papers_md/*.md: output a cleaned version to projects/graphrag/docs/papers_clean/ with the same basename. Rules: preserve meaning, preserve headings/code blocks/lists, remove HTML/MathML/SVG junk/anchors/navigation boilerplate; do NOT summarize; do NOT add new content. Use the prompt template at projects/graphrag/prompts/clean_md_llama8b.md."
```

## 3) Inspect runs
```bash
openclaw cron runs | tail -n 50
openclaw cron status
```

## 4) If you want to rerun
Either:
- add another `--at +1m` job with a different name, or
- keep after run and call `openclaw cron run --name ...` (for debug).
