#!/usr/bin/env python3
"""Build a Feishu *compatible* interactive card payload for daily model scan.

Important: Although we send msg_type=interactive, this tenant renders the card
using a legacy "title/elements" shape.

Empirically working shape:
{
  "config": {...},
  "header": {...},
  "elements": [ {tag:"div"...}, {tag:"hr"}, ... ]
}

Unsupported in this environment for the interactive card renderer:
- `note` tag (schema v2)
- header.icon with tag img

So we avoid those and keep a clean, minimal card.
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
            return "暂无（可能未配置 Key / 被限流）"
        return ", ".join(models[:3])

    # Minimal, emoji-free
    elements = [
        {
            "tag": "div",
            "text": {
                "tag": "lark_md",
                "content": f"**{args.title}**  |  {date_bj}（北京）",
            },
        },
        {"tag": "div", "text": {"tag": "lark_md", "content": ""}},
        {"tag": "div", "text": {"tag": "lark_md", "content": "### 公益站（api-925214）"}},
        {
            "tag": "div",
            "text": {"tag": "lark_md", "content": f"可用模型（Top3）：{fmt_models(pub)}"},
        },
        {"tag": "hr"},
        {"tag": "div", "text": {"tag": "lark_md", "content": "### MiniMax"}},
        {
            "tag": "div",
            "text": {"tag": "lark_md", "content": f"可用模型：{fmt_models(mm)}"},
        },
        {"tag": "hr"},
        {
            "tag": "div",
            "text": {"tag": "lark_md", "content": f"产物目录：`{str(art)}`"},
        },
    ]

    card = {
        "config": {"wide_screen_mode": True, "enable_forward": True},
        "header": {
            "template": "blue",
            "title": {"tag": "plain_text", "content": args.title},
        },
        # Critical: use top-level `elements` (NOT body.elements)
        "elements": elements,
    }

    Path(args.out).write_text(json.dumps(card, ensure_ascii=False), "utf-8")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
