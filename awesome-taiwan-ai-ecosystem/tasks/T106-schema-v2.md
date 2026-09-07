---
github_issue: N/A
title: schema/registry.json 升級到 v2.0（Entity wrapper）
type: refactor
priority: low
status: pending
assignee: pi with opencode
created: 2026-09-07
depends_on: [T097, T104]
updated: 2026-09-07
---

# T106 - schema/registry.json 升級到 v2.0（Entity wrapper）

## 目標

把 `schema/registry.json` 從 v0.1 legacy wrapper（`servers: []MCPServer`）升級到 v2.0 Entity wrapper（`entities: []Entity`），對齊 `internal/models/entity.go` 的 canonical model。

現況問題：`schema/registry.json` 仍是 v0.1，wrapper 欄位為 `servers: []MCPServer`，與 `cmd/crawler` 產出的 legacy 9/5 registry 對應；新架構的 `Entity` wrapper 沒有對應 JSON schema。

阻塞：
- spec §37 entity schema 對外契約
- spec §44 view 與 API 對外 JSON 結構定義

## 問題根因

`schema/registry.json:1-20`：

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "Taiwan MCP Registry",
  "description": "Taiwan MCP Registry Schema v0.1 - Registry wrapper",
  "type": "object",
  "required": ["schema_version", "servers"],
  "properties": {
    "schema_version": {"type": "string", "const": "0.1"},
    "generated_at": {"type": "string", "format": "date-time"},
    "crawler_version": {"type": "string"},
    "servers": {
      "type": "array",
      ...
    }
  }
}
```

僅描述 legacy `MCPServer` shape。

## 修法

### A. 寫 `schema/entity.json`（新檔）

依 `internal/models/entity.go` 的 `Entity` struct 與 spec §37 寫 v2.0 schema：

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "Taiwan AI Ecosystem Entity",
  "description": "Taiwan AI Ecosystem Entity Schema v2.0 (spec §37, §61 Phase 1)",
  "type": "object",
  "required": ["id", "name", "classification"],
  "properties": {
    "id": {"type": "string", "description": "sha256 hex of canonical identity"},
    "name": {"type": "string"},
    "slug": {"type": "string"},
    "description": {"type": "string"},
    "classification": {
      "type": "object",
      "required": ["primary"],
      "properties": {
        "primary": {
          "type": "string",
          "enum": ["MCP_SERVER", "MCP_CLIENT", "AI_AGENT", "AI_TOOL", "DATA_LIBRARY", "NOT_AI", "UNKNOWN", "..."]
        },
        "secondary": {"type": "array", "items": {"type": "string"}},
        "confidence": {"type": "number", "minimum": 0, "maximum": 100}
      }
    },
    "taiwan_relevance": {
      "type": "object",
      "properties": {
        "score": {"type": "number", "minimum": 0, "maximum": 100},
        "evidence": {"type": "array", "items": {"type": "string"}}
      }
    },
    "ai_relevance": {
      "type": "object",
      "properties": {
        "score": {"type": "number", "minimum": 0, "maximum": 100},
        "evidence": {"type": "array", "items": {"type": "string"}}
      }
    },
    "mcp_identity": {
      "type": "object",
      "properties": {
        "related": {"type": "boolean"},
        "status": {
          "type": "string",
          "enum": ["CANDIDATE", "STATIC_VERIFIED", "RUNTIME_VERIFIED", "VERIFIED", "NOT_MCP"]
        },
        "role": {"type": "string"},
        "confidence": {"type": "number", "minimum": 0, "maximum": 100}
      }
    },
    "endpoints": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "url": {"type": "string"},
          "type": {
            "type": "string",
            "enum": ["MCP_RUNTIME_ENDPOINT", "REPOSITORY_URL", "DOCUMENTATION_URL", "INSTALLER_URL", "PACKAGE_URL", "DEMO_URL", "WEBSITE_URL", "API_URL", "UNKNOWN_URL"]
          },
          "transport": {"type": "string"},
          "verified": {"type": "boolean"}
        }
      }
    },
    "verification": {
      "type": "object",
      "properties": {
        "status": {"type": "string"},
        "checked_at": {"type": "string", "format": "date-time"}
      }
    },
    "security_status": {
      "type": "object",
      "properties": {
        "overall_risk": {"type": "string", "enum": ["LOW", "MEDIUM", "HIGH", "CRITICAL", "UNKNOWN"]}
      }
    },
    "quality": {
      "type": "object",
      "properties": {
        "score": {"type": "number"},
        "grade": {"type": "string", "enum": ["A", "B", "C", "D", "F", "UNKNOWN"]}
      }
    },
    "sources": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "primary": {"type": "boolean"},
          "source": {"type": "string"},
          "url": {"type": "string"},
          "trust_score": {"type": "number"}
        }
      }
    },
    "lifecycle": {
      "type": "object",
      "properties": {
        "discovered_at": {"type": "string", "format": "date-time"},
        "updated_at": {"type": "string", "format": "date-time"},
        "last_verified_at": {"type": "string", "format": "date-time"}
      }
    }
  }
}
```

### B. 寫 `schema/registry.json` v2.0（覆蓋舊檔）

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "Taiwan AI Ecosystem Registry",
  "description": "Taiwan AI Ecosystem Registry Schema v2.0 - Canonical entity wrapper (spec §37, §44)",
  "type": "object",
  "required": ["schema_version", "entities"],
  "properties": {
    "schema_version": {"type": "string", "const": "2.0"},
    "generated_at": {"type": "string", "format": "date-time"},
    "crawler_version": {"type": "string"},
    "entities": {
      "type": "array",
      "items": {"$ref": "entity.json"}
    }
  }
}
```

### C. 既有的 `schema/mcp-server.json`

保留為 legacy reference（產出 legacy `REGISTRY.md` 時用），不刪。在 `schema/mcp-server.json` 開頭加註解指向 `entity.json` 為新標準。

### D. view_generator 對齊

`internal/export/view_generator.go` 的 `ViewConfig.SchemaVersion` 從 `"2.0"` 確認（已是 v2.0，T097 看過），產出的 JSON 帶 `schema_version: 2.0`。`cmd/export/main.go:59` 也是 `"2.0"`。

若 view generator 對外 JSON 與 `entity.json` 對齊，本任務只動 `schema/` 兩個檔。

## 驗收標準

- [ ] `schema/entity.json` 新檔，依 `Entity` struct 與 spec §37 寫 v2.0
- [ ] `schema/registry.json` 改為 v2.0 wrapper，entities array 引用 entity.json
- [ ] `schema/mcp-server.json` 加 legacy 註解
- [ ] `go build ./...` 通過
- [ ] `jsonschema -i registry/registry.json schema/registry.json` 通過（驗證產出符合 schema）
- [ ] 跑 `bin/export` 產出的 `registry/taiwan-ai-ecosystem.json` 通過 `schema/registry.json` 驗證
- [ ] 跑 `jsonschema -i registry/REGISTRY.md` 不適用（markdown 不需驗證）

## 執行紀錄

_(待執行後填寫)_

## 備註

- 依賴 T097（差距分析）、T104（Entity schema 補欄位 — 否則 entity.json 與 Entity struct 不對齊）
- 對應 spec §37、§44
- 風險：v0.1 → v2.0 是不向後相容升級，但 v0.1 的 `REGISTRY.md` 是 9/5 legacy 產物，已被 T099 取代
- jsonschema CLI 需另外裝（`brew install jsonschema` 或 `pip install jsonschema`），不在 repo 內
- 相關任務：T097、T104、T099（export 用到這 schema）
