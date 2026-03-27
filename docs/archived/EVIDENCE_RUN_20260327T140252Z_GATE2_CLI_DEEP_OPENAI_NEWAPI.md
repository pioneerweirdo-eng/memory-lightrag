# Gate2 Evidence via openclaw memory --deep (openai provider, new-api baseUrl)
timestamp_utc: 2026-03-27T14:02:52Z
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
      "ok": false,
      "error": "fetch failed"
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
      "ok": false,
      "error": "openai embeddings failed: 401 {\n  \"error\": {\n    \"message\": \"Incorrect API key provided: sk-fjwky***************************************bwix. You can find your API key at https://platform.openai.com/account/api-keys.\",\n    \"type\": \"invalid_request_error\",\n    \"code\": \"invalid_api_key\",\n    \"param\": null\n  },\n  \"status\": 401\n}"
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
      "ok": false,
      "error": "openai embeddings failed: 401 {\n  \"error\": {\n    \"message\": \"Incorrect API key provided: sk-fjwky***************************************bwix. You can find your API key at https://platform.openai.com/account/api-keys.\",\n    \"type\": \"invalid_request_error\",\n    \"code\": \"invalid_api_key\",\n    \"param\": null\n  },\n  \"status\": 401\n}"
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
      "ok": false,
      "error": "openai embeddings failed: 401 {\n  \"error\": {\n    \"message\": \"Incorrect API key provided: sk-fjwky***************************************bwix. You can find your API key at https://platform.openai.com/account/api-keys.\",\n    \"type\": \"invalid_request_error\",\n    \"code\": \"invalid_api_key\",\n    \"param\": null\n  },\n  \"status\": 401\n}"
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
      "ok": false,
      "error": "openai embeddings failed: 401 {\n  \"error\": {\n    \"message\": \"Incorrect API key provided: sk-fjwky***************************************bwix. You can find your API key at https://platform.openai.com/account/api-keys.\",\n    \"type\": \"invalid_request_error\",\n    \"code\": \"invalid_api_key\",\n    \"param\": null\n  },\n  \"status\": 401\n}"
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
      "ok": false,
      "error": "openai embeddings failed: 401 {\n  \"error\": {\n    \"message\": \"Incorrect API key provided: sk-fjwky***************************************bwix. You can find your API key at https://platform.openai.com/account/api-keys.\",\n    \"type\": \"invalid_request_error\",\n    \"code\": \"invalid_api_key\",\n    \"param\": null\n  },\n  \"status\": 401\n}"
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
      "ok": false,
      "error": "openai embeddings failed: 401 {\n  \"error\": {\n    \"message\": \"Incorrect API key provided: sk-fjwky***************************************bwix. You can find your API key at https://platform.openai.com/account/api-keys.\",\n    \"type\": \"invalid_request_error\",\n    \"code\": \"invalid_api_key\",\n    \"param\": null\n  },\n  \"status\": 401\n}"
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
