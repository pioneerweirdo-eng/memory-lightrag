#!/usr/bin/env bash
set -euo pipefail

# Probe daiju chat endpoint for llama3.1-8B.
# Usage:
#   DAIJU_API_KEY=... ./daiju_probe.sh [--tries 5] [--sleep 2]

TRIES=5
SLEEP_S=2
while [[ $# -gt 0 ]]; do
  case "$1" in
    --tries) TRIES="$2"; shift 2;;
    --sleep) SLEEP_S="$2"; shift 2;;
    *) echo "Unknown arg: $1"; exit 2;;
  esac
done

if [[ -z "${DAIJU_API_KEY:-}" ]]; then
  echo "Missing DAIJU_API_KEY" >&2
  exit 2
fi

payload='{"model":"llama3.1-8B","messages":[{"role":"user","content":"Reply with exactly: OK"}],"max_tokens":8,"temperature":0}'

for i in $(seq 1 "$TRIES"); do
  code=$(curl -sS -o /tmp/daiju_probe_body.txt -w "%{http_code}" -m 15 \
    -H "Authorization: Bearer ${DAIJU_API_KEY}" \
    -H "Content-Type: application/json" \
    https://api.daiju.live/v1/chat/completions \
    --data-binary "$payload" || echo 000)
  echo "probe $i/$TRIES http=$code"
  if [[ "$code" == "200" ]]; then
    head -c 120 /tmp/daiju_probe_body.txt; echo
    exit 0
  fi
  sleep "$SLEEP_S"
done

echo "probe failed" >&2
head -c 200 /tmp/daiju_probe_body.txt; echo >&2
exit 1
