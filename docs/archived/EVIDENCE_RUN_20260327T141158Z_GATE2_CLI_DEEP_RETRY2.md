# Gate2 Evidence via openclaw memory --deep (retry2)
timestamp_utc: 2026-03-27T14:11:58Z
cwd: /home/node/.openclaw/workspace/agents/director

## CMD: openclaw memory status --deep --json
[35m[plugins][39m [36mmodel-config-admin: routes registered[39m
[35m[plugins][39m [36mfeishu_doc: Registered feishu_doc, feishu_app_scopes[39m
[35m[plugins][39m [36mfeishu_chat: Registered feishu_chat tool[39m
[35m[plugins][39m [36mfeishu_wiki: Registered feishu_wiki tool[39m
[35m[plugins][39m [36mfeishu_drive: Registered feishu_drive tool[39m
[35m[plugins][39m [36mfeishu_perm: Registered feishu_perm tool[39m
[35m[plugins][39m [36mfeishu_bitable: Registered bitable tools[39m
[35m[plugins][39m [36mmodel-config-admin: routes registered[39m
[35m[plugins][39m [36mfeishu_doc: Registered feishu_doc, feishu_app_scopes[39m
[35m[plugins][39m [36mfeishu_chat: Registered feishu_chat tool[39m
[35m[plugins][39m [36mfeishu_wiki: Registered feishu_wiki tool[39m
[35m[plugins][39m [36mfeishu_drive: Registered feishu_drive tool[39m
[35m[plugins][39m [36mfeishu_perm: Registered feishu_perm tool[39m
[35m[plugins][39m [36mfeishu_bitable: Registered bitable tools[39m
[35m[plugins][39m [36mmodel-config-admin: routes registered[39m
[35m[plugins][39m [36mfeishu_doc: Registered feishu_doc, feishu_app_scopes[39m
[35m[plugins][39m [36mfeishu_chat: Registered feishu_chat tool[39m
[35m[plugins][39m [36mfeishu_wiki: Registered feishu_wiki tool[39m
[35m[plugins][39m [36mfeishu_drive: Registered feishu_drive tool[39m
[35m[plugins][39m [36mfeishu_perm: Registered feishu_perm tool[39m
[35m[plugins][39m [36mfeishu_bitable: Registered bitable tools[39m
[35m[plugins][39m [36mmodel-config-admin: routes registered[39m
[35m[plugins][39m [36mfeishu_doc: Registered feishu_doc, feishu_app_scopes[39m
[35m[plugins][39m [36mfeishu_chat: Registered feishu_chat tool[39m
[35m[plugins][39m [36mfeishu_wiki: Registered feishu_wiki tool[39m
[35m[plugins][39m [36mfeishu_drive: Registered feishu_drive tool[39m
[35m[plugins][39m [36mfeishu_perm: Registered feishu_perm tool[39m
[35m[plugins][39m [36mfeishu_bitable: Registered bitable tools[39m
[
  {
    "agentId": "health-manager",
    "status": {
      "backend": "builtin",
      "files": 51,
      "chunks": 106,
      "dirty": false,
      "workspaceDir": "/home/node/.openclaw/workspace",
      "dbPath": "/home/node/.openclaw/memory/health-manager.sqlite",
      "provider": "openai",
      "model": "BAAI/bge-m3",
      "requestedProvider": "openai",
      "sources": [
        "memory"
      ],
      "extraPaths": [],
      "sourceCounts": [
        {
          "source": "memory",
          "files": 51,
          "chunks": 106
        }
      ],
      "cache": {
        "enabled": true,
        "entries": 104
      },
      "fts": {
        "enabled": true,
        "available": true
      },
      "vector": {
        "enabled": true,
        "available": true,
        "extensionPath": "/app/node_modules/sqlite-vec-linux-x64/vec0.so",
        "dims": 1024
      },
      "batch": {
        "enabled": false,
        "failures": 0,
        "limit": 2,
        "wait": true,
        "concurrency": 2,
        "pollIntervalMs": 2000,
        "timeoutMs": 3600000
      },
      "custom": {
        "searchMode": "hybrid",
        "readonlyRecovery": {
          "attempts": 0,
          "successes": 0,
          "failures": 0
        }
      }
    },
    "embeddingProbe": {
      "ok": true
    },
    "scan": {
      "sources": [
        {
          "source": "memory",
          "totalFiles": 55,
          "issues": []
        }
      ],
      "totalFiles": 55,
      "issues": []
    }
  },
  {
    "agentId": "gate2-runner",
    "status": {
      "backend": "builtin",
      "files": 0,
      "chunks": 0,
      "dirty": true,
      "workspaceDir": "/home/node/.openclaw/workspace",
      "dbPath": "/home/node/.openclaw/memory/gate2-runner.sqlite",
      "provider": "openai",
      "model": "BAAI/bge-m3",
      "requestedProvider": "openai",
      "sources": [
        "memory"
      ],
      "extraPaths": [],
      "sourceCounts": [
        {
          "source": "memory",
          "files": 0,
          "chunks": 0
        }
      ],
      "cache": {
        "enabled": true,
        "entries": 0
      },
      "fts": {
        "enabled": true,
        "available": true
      },
      "vector": {
        "enabled": true,
        "available": true,
        "extensionPath": "/app/node_modules/sqlite-vec-linux-x64/vec0.so"
      },
      "batch": {
        "enabled": false,
        "failures": 0,
        "limit": 2,
        "wait": true,
        "concurrency": 2,
        "pollIntervalMs": 2000,
        "timeoutMs": 3600000
      },
      "custom": {
        "searchMode": "hybrid",
        "readonlyRecovery": {
          "attempts": 0,
          "successes": 0,
          "failures": 0
        }
      }
    },
    "embeddingProbe": {
      "ok": true
    },
    "scan": {
      "sources": [
        {
          "source": "memory",
          "totalFiles": 55,
          "issues": []
        }
      ],
      "totalFiles": 55,
      "issues": []
    }
  },
  {
    "agentId": "coding-agent",
    "status": {
      "backend": "builtin",
      "files": 0,
      "chunks": 0,
      "dirty": false,
      "workspaceDir": "/home/node/.openclaw/workspace-coding",
      "dbPath": "/home/node/.openclaw/memory/coding-agent.sqlite",
      "provider": "openai",
      "model": "BAAI/bge-m3",
      "requestedProvider": "openai",
      "sources": [
        "memory"
      ],
      "extraPaths": [],
      "sourceCounts": [
        {
          "source": "memory",
          "files": 0,
          "chunks": 0
        }
      ],
      "cache": {
        "enabled": true,
        "entries": 0
      },
      "fts": {
        "enabled": true,
        "available": true
      },
      "vector": {
        "enabled": true,
        "available": true,
        "extensionPath": "/app/node_modules/sqlite-vec-linux-x64/vec0.so"
      },
      "batch": {
        "enabled": false,
        "failures": 0,
        "limit": 2,
        "wait": true,
        "concurrency": 2,
        "pollIntervalMs": 2000,
        "timeoutMs": 3600000
      },
      "custom": {
        "searchMode": "hybrid",
        "readonlyRecovery": {
          "attempts": 0,
          "successes": 0,
          "failures": 0
        }
      }
    },
    "embeddingProbe": {
      "ok": true
    },
    "scan": {
      "sources": [
        {
          "source": "memory",
          "totalFiles": 1,
          "issues": []
        }
      ],
      "totalFiles": 1,
      "issues": []
    }
  },
  {
    "agentId": "director",
    "status": {
      "backend": "builtin",
      "files": 8,
      "chunks": 18,
      "dirty": false,
      "workspaceDir": "/home/node/.openclaw/workspace/agents/director",
      "dbPath": "/home/node/.openclaw/memory/director.sqlite",
      "provider": "openai",
      "model": "BAAI/bge-m3",
      "requestedProvider": "openai",
      "sources": [
        "memory"
      ],
      "extraPaths": [],
      "sourceCounts": [
        {
          "source": "memory",
          "files": 8,
          "chunks": 18
        }
      ],
      "cache": {
        "enabled": true,
        "entries": 19
      },
      "fts": {
        "enabled": true,
        "available": true
      },
      "vector": {
        "enabled": true,
        "available": true,
        "extensionPath": "/app/node_modules/sqlite-vec-linux-x64/vec0.so",
        "dims": 1024
      },
      "batch": {
        "enabled": false,
        "failures": 0,
        "limit": 2,
        "wait": true,
        "concurrency": 2,
        "pollIntervalMs": 2000,
        "timeoutMs": 3600000
      },
      "custom": {
        "searchMode": "hybrid",
        "readonlyRecovery": {
          "attempts": 0,
          "successes": 0,
          "failures": 0
        }
      }
    },
    "embeddingProbe": {
      "ok": true
    },
    "scan": {
      "sources": [
        {
          "source": "memory",
          "totalFiles": 8,
          "issues": []
        }
      ],
      "totalFiles": 8,
      "issues": []
    }
  },
  {
    "agentId": "model-config-backend",
    "status": {
      "backend": "builtin",
      "files": 0,
      "chunks": 0,
      "dirty": true,
      "workspaceDir": "/home/node/.openclaw/workspace/agents/model-config-backend",
      "dbPath": "/home/node/.openclaw/memory/model-config-backend.sqlite",
      "provider": "openai",
      "model": "BAAI/bge-m3",
      "requestedProvider": "openai",
      "sources": [
        "memory"
      ],
      "extraPaths": [],
      "sourceCounts": [
        {
          "source": "memory",
          "files": 0,
          "chunks": 0
        }
      ],
      "cache": {
        "enabled": true,
        "entries": 0
      },
      "fts": {
        "enabled": true,
        "available": true
      },
      "vector": {
        "enabled": true,
        "available": true,
        "extensionPath": "/app/node_modules/sqlite-vec-linux-x64/vec0.so"
      },
      "batch": {
        "enabled": false,
        "failures": 0,
        "limit": 2,
        "wait": true,
        "concurrency": 2,
        "pollIntervalMs": 2000,
        "timeoutMs": 3600000
      },
      "custom": {
        "searchMode": "hybrid",
        "readonlyRecovery": {
          "attempts": 0,
          "successes": 0,
          "failures": 0
        }
      }
    },
    "embeddingProbe": {
      "ok": true
    },
    "scan": {
      "sources": [
        {
          "source": "memory",
          "totalFiles": 0,
          "issues": [
            "memory directory missing (~/.openclaw/workspace/agents/model-config-backend/memory)"
          ]
        }
      ],
      "totalFiles": 0,
      "issues": [
        "memory directory missing (~/.openclaw/workspace/agents/model-config-backend/memory)"
      ]
    }
  },
  {
    "agentId": "model-config-frontend",
    "status": {
      "backend": "builtin",
      "files": 0,
      "chunks": 0,
      "dirty": true,
      "workspaceDir": "/home/node/.openclaw/workspace/agents/model-config-frontend",
      "dbPath": "/home/node/.openclaw/memory/model-config-frontend.sqlite",
      "provider": "openai",
      "model": "BAAI/bge-m3",
      "requestedProvider": "openai",
      "sources": [
        "memory"
      ],
      "extraPaths": [],
      "sourceCounts": [
        {
          "source": "memory",
          "files": 0,
          "chunks": 0
        }
      ],
      "cache": {
        "enabled": true,
        "entries": 0
      },
      "fts": {
        "enabled": true,
        "available": true
      },
      "vector": {
        "enabled": true,
        "available": true,
        "extensionPath": "/app/node_modules/sqlite-vec-linux-x64/vec0.so"
      },
      "batch": {
        "enabled": false,
        "failures": 0,
        "limit": 2,
        "wait": true,
        "concurrency": 2,
        "pollIntervalMs": 2000,
        "timeoutMs": 3600000
      },
      "custom": {
        "searchMode": "hybrid",
        "readonlyRecovery": {
          "attempts": 0,
          "successes": 0,
          "failures": 0
        }
      }
    },
    "embeddingProbe": {
      "ok": true
    },
    "scan": {
      "sources": [
        {
          "source": "memory",
          "totalFiles": 0,
          "issues": [
            "memory directory missing (~/.openclaw/workspace/agents/model-config-frontend/memory)"
          ]
        }
      ],
      "totalFiles": 0,
      "issues": [
        "memory directory missing (~/.openclaw/workspace/agents/model-config-frontend/memory)"
      ]
    }
  },
  {
    "agentId": "model-config-qa",
    "status": {
      "backend": "builtin",
      "files": 0,
      "chunks": 0,
      "dirty": true,
      "workspaceDir": "/home/node/.openclaw/workspace/agents/model-config-qa",
      "dbPath": "/home/node/.openclaw/memory/model-config-qa.sqlite",
      "provider": "openai",
      "model": "BAAI/bge-m3",
      "requestedProvider": "openai",
      "sources": [
        "memory"
      ],
      "extraPaths": [],
      "sourceCounts": [
        {
          "source": "memory",
          "files": 0,
          "chunks": 0
        }
      ],
      "cache": {
        "enabled": true,
        "entries": 0
      },
      "fts": {
        "enabled": true,
        "available": true
      },
      "vector": {
        "enabled": true,
        "available": true,
        "extensionPath": "/app/node_modules/sqlite-vec-linux-x64/vec0.so"
      },
      "batch": {
        "enabled": false,
        "failures": 0,
        "limit": 2,
        "wait": true,
        "concurrency": 2,
        "pollIntervalMs": 2000,
        "timeoutMs": 3600000
      },
      "custom": {
        "searchMode": "hybrid",
        "readonlyRecovery": {
          "attempts": 0,
          "successes": 0,
          "failures": 0
        }
      }
    },
    "embeddingProbe": {
      "ok": true
    },
    "scan": {
      "sources": [
        {
          "source": "memory",
          "totalFiles": 0,
          "issues": [
            "memory directory missing (~/.openclaw/workspace/agents/model-config-qa/memory)"
          ]
        }
      ],
      "totalFiles": 0,
      "issues": [
        "memory directory missing (~/.openclaw/workspace/agents/model-config-qa/memory)"
      ]
    }
  }
]

## CMD: openclaw memory search --query env-ops-standard --json
{
  "results": [
    {
      "path": "memory/2026-03-24.md",
      "startLine": 1,
      "endLine": 17,
      "score": 0.5497695405111587,
      "snippet": "\n### 审核反馈（需返工）\n- 用户审核不通过，要求先别上线。\n- 关键问题：\n  1) package.json 依赖 \"openclaw/plugin-sdk\": \"*\" 无效，npm 报 EINVALIDPACKAGENAME。\n  2) LightRAG API 端点错误：应使用 /query/data，而非 /search。\n  3) 默认 baseUrl 应为 http://lightrag:9621（当前默认 localhost:9686 不符）。\n  4) CLI 冲突风险：registerMemoryCli 后又手动添加 status 子命令。\n  5) 可观测性不足：需要结构化 fallback 日志，不能只在返回体拼字段。\n- 用户建议 5 条最小返工并愿意接手修补。\n\n### 会话要点（待下次继续）\n- 需要进行 OpenClaw 插件最佳实践深度审计（academic-deep-research），用户要求外部检索，但当前会话未启用 web_search/web_fetch；需配置 tools.allow=group:web。\n- Moltbook：用户要求“逛论坛多交互”。已发现 moltbook 脚本在 `/home/node/.openclaw/workspace/skills/moltbook-interact/scripts/moltbook.sh`，只读 `~/.config/moltbook/credentials.json` 或 OpenClaw auth，不读 `.env` 的 MOLTBOOK_BASE_URL。\n- 已用 `.e",
      "source": "memory"
    }
  ]
}
