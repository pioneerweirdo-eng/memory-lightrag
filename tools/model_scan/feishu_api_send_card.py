#!/usr/bin/env python3
"""Send a Feishu *interactive card* via Feishu OpenAPI directly.

Why:
- OpenClaw `renderMode=card` wraps text into a plain card (ugly but stable).
- OpenClaw CLI `message send --card` is not reliably routed to Feishu plugin in this environment.
- This script uses Feishu OpenAPI `im/v1/message/create` with `msg_type=interactive`.

Auth:
- Reads FEISHU_APP_ID / FEISHU_APP_SECRET from /home/node/.openclaw/.env

Usage:
  python3 feishu_api_send_card.py --to-open-id <open_id> --card-json /path/card.json

Note:
- This sends outbound messages (external). Use carefully.
"""

from __future__ import annotations

import argparse
import json
import os
import urllib.request
import urllib.error
from pathlib import Path

OPENAPI_BASE = os.environ.get("FEISHU_OPENAPI_BASE", "https://open.feishu.cn")
ENV_FILE = Path("/home/node/.openclaw/.env")


def load_env_file(path: Path) -> dict[str, str]:
    out: dict[str, str] = {}
    if not path.exists():
        return out
    for line in path.read_text("utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        k, v = line.split("=", 1)
        out[k.strip()] = v.strip()
    return out


def http_json(url: str, payload: dict, headers: dict[str, str] | None = None, timeout_s: int = 25) -> dict:
    data = json.dumps(payload, ensure_ascii=False).encode("utf-8")
    req = urllib.request.Request(url, data=data, method="POST")
    req.add_header("Content-Type", "application/json")
    req.add_header("User-Agent", "OpenClaw/feishu-card-sender")
    if headers:
        for k, v in headers.items():
            req.add_header(k, v)
    try:
        with urllib.request.urlopen(req, timeout=timeout_s) as resp:
            body = resp.read().decode("utf-8", "replace")
            return json.loads(body)
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8", "replace")
        try:
            j = json.loads(body)
        except Exception:
            j = {"error": body}
        j["_http_status"] = e.code
        raise RuntimeError(f"HTTP {e.code}: {j}")


def get_tenant_access_token(app_id: str, app_secret: str) -> str:
    url = OPENAPI_BASE.rstrip("/") + "/open-apis/auth/v3/tenant_access_token/internal"
    j = http_json(url, {"app_id": app_id, "app_secret": app_secret})
    if j.get("code") != 0:
        raise RuntimeError(f"token error: {j}")
    token = j.get("tenant_access_token")
    if not token:
        raise RuntimeError(f"token missing: {j}")
    return token


def send_interactive_card(*, token: str, to_open_id: str, card: dict) -> dict:
    url = OPENAPI_BASE.rstrip("/") + "/open-apis/im/v1/messages?receive_id_type=open_id"
    # NOTE: Feishu expects card JSON in `card` field for msg_type=interactive.
    payload = {
        "receive_id": to_open_id,
        "msg_type": "interactive",
        # Some Feishu deployments validate `content` required even for interactive.
        "content": json.dumps(card, ensure_ascii=False),
        "card": card,
    }
    j = http_json(url, payload, headers={"Authorization": f"Bearer {token}"})
    if j.get("code") != 0:
        raise RuntimeError(f"send error: {j}")
    return j


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--to-open-id", required=True)
    ap.add_argument("--card-json", required=True)
    args = ap.parse_args()

    env = load_env_file(ENV_FILE)
    app_id = env.get("FEISHU_APP_ID") or os.environ.get("FEISHU_APP_ID")
    app_secret = env.get("FEISHU_APP_SECRET") or os.environ.get("FEISHU_APP_SECRET")
    if not app_id or not app_secret:
        raise SystemExit("Missing FEISHU_APP_ID/FEISHU_APP_SECRET in /home/node/.openclaw/.env")

    card = json.loads(Path(args.card_json).read_text("utf-8"))

    token = get_tenant_access_token(app_id, app_secret)
    resp = send_interactive_card(token=token, to_open_id=args.to_open_id, card=card)
    # Print message_id for debugging
    print(json.dumps(resp, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
