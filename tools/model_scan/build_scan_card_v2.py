#!/usr/bin/env python3
"""Build a Feishu interactive card payload for the daily model scan.

We follow Feishu Card JSON 2.0 structure (schema=2.0) using top-level `elements`
(as per Feishu examples).

Constraints discovered by experimentation in this tenant:
- Markdown is not reliably parsed => use plain_text.
- `note` tag caused server-side rejection.
- header.icon with an `img` tag was rejected.

So we keep the card minimal and stable: header + div/hr + action buttons.
"""

from __future__ import annotations

import argparse
import datetime as dt
import json
from pathlib import Path


def bj_date() -> str:
    return (dt.datetime.utcnow() + dt.timedelta(hours=8)).strftime("%Y-%m-%d")


def load_ranked(path: Path) -> list[str]:
    if not path.exists():
        return []
    try:
        j = json.loads(path.read_text("utf-8"))
        return j.get("ranked") or []
    except Exception:
        return []


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--art-dir", required=True)
    ap.add_argument("--out", required=True)
    ap.add_argument("--title", default="模型扫描日报")
    args = ap.parse_args()

    art = Path(args.art_dir)
    date_bj = bj_date()
    date_utc = dt.datetime.utcnow().strftime("%Y-%m-%d")

    mm = load_ranked(art / f"minimax-cn-ranked-{date_utc}.json")
    pub = load_ranked(art / f"api-925214-ranked-{date_utc}.json")

    def fmt_models(models: list[str]) -> str:
        if not models:
            return "暂无(可能未配置Key/被限流)"
        return ", ".join(models[:3])

    # Minimal, emoji-free
    # In this tenant, the interactive renderer degrades into legacy text blocks.
    # Markdown is NOT parsed reliably, so we only use plain_text.
    elements = [
        {
            "tag": "div",
            "text": {
                "tag": "plain_text",
                "content": f"{args.title} | {date_bj}（北京）",
            },
        },
        {"tag": "div", "text": {"tag": "plain_text", "content": ""}},
        {"tag": "div", "text": {"tag": "plain_text", "content": "公益站（api-925214）"}},
        {
            "tag": "div",
            "text": {"tag": "plain_text", "content": f"可用模型(Top3)：{fmt_models(pub)}"},
        },
        {"tag": "hr"},
        {"tag": "div", "text": {"tag": "plain_text", "content": "MiniMax"}},
        {
            "tag": "div",
            "text": {"tag": "plain_text", "content": f"可用模型：{fmt_models(mm)}"},
        },
        {"tag": "hr"},
        {
            "tag": "div",
            "text": {"tag": "plain_text", "content": f"产物目录：{str(art)}"},
        },
    ]

    # IMPORTANT: For this tenant, sending the card via OpenAPI `content` works best
    # when we use the "v2 compat" structure:
    # { config, header, elements:[{tag:div/hr/action...}] }
    # Feishu will internally transform it to legacy title/elements when delivering.

    card = {
        "config": {"wide_screen_mode": True, "enable_forward": True},
        "header": {
            "template": "blue",
            "title": {"tag": "plain_text", "content": args.title},
        },
        "elements": [
            *elements,
            {"tag": "hr"},
            {
                "tag": "action",
                "actions": [
                    {
                        "tag": "button",
                        "text": {"tag": "plain_text", "content": "查看目录"},
                        "type": "default",
                        "value": "open_artifacts",
                    },
                    {
                        "tag": "button",
                        "text": {"tag": "plain_text", "content": "重新扫描"},
                        "type": "primary",
                        "value": "rerun_scan",
                    },
                ],
            },
        ],
    }

    Path(args.out).write_text(json.dumps(card, ensure_ascii=False), "utf-8")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
