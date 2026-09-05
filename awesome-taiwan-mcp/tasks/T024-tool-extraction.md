---
github_issue: N/A
title: Tool Extraction — tools/list 結果保存
assignee: pi with opencode
type: feat
priority: high
^status: done
depends_on: []
created: 2026-09-05
updated: 2026-09-05
---

# T024 - Tool Extraction — tools/list 結果保存

## 目標

從 MCP protocol 的 `tools/list` 取得 tools 並保存。
對應 CRAWLER_AGENT_TASKS.md §26 TASK-026, §28 Tool Discovery。

## 驗收標準

- [x] 從 `tools/list` 回應中提取: name, description, input_schema, annotations (§28, §9.1 Tool Schema)
- [x] Tool struct 實現 (§9.1): Name, Description, InputSchema (map[string]any), Annotations (read_only, destructive)
- [x] Tools 保存到 SQLite `tools` 表: server_id, name, description, input_schema, annotations
- [x] Tools 保存到 MCPServer.Tools []Tool
- [x] Tool 去重: 基於 name + server_id (UNIQUE constraint)
- [x] Invalid tool (name empty + description empty + no input_schema) 被 reject 或標記 INVALID
- [x] input_schema 驗證: 必須是有效的 JSON Schema object
- [x] Tool annotations 解析: read_only (bool), destructive (bool), idempotent (bool), open (potential value)
- [x] 單元測試: mock server 回傳 10 tools → database 存入 10 tools (§TST-028)
- [x] 單元測試: 每 tool name != empty, description != empty OR explicitly allowed, input_schema valid (§TST-028)

## 備註

- Tool discovery 來自 MCP protocol (tools/list), NOT from executing tools
- Tools 也可來自 manifest parsing (T009)
- Tool schema 是 Quality Score 的組成部分 (§31: Tool Schema 10 points)
- Tool name + input_schema 用於 Capability Search (§22 Capability Search)

## 執行紀錄（2026-09-05 稽核）
- 已達成: 依據最終驗證 (T045) 通過 build+test+vet+mod verify, 代碼在對應 internal/ 套件中實現, 測試覆蓋率達標
