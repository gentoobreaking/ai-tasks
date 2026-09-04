---
github_issue: N/A
title: P1 - Complete MCP Protocol Types
type: feat
priority: high
status: done
depends_on:
- T004
assignee: "pi with opencode"
created: 2026-09-04
updated: 2026-09-04
---

# T075 - Complete MCP Protocol Types

## 目標

擴充 `core/protocol/` 對齊 MCP specification 的完整 JSON-RPC 2.0 types，包含 error codes 和標準 request/response 結構。

## 驗收標準

- [x] Error codes: `parse_error (-32700)`, `invalid_request (-32600)`, `method_not_found (-32601)`, `invalid_params (-32602)`, `internal_error (-32603)`
- [x] `PromptListParams`, `ResourceListParams`, `ToolListParams` request types
- [x] `PromptListResult`, `ResourceListResult`, `ToolListResult` response types
- [x] `ResourceTemplate` type for URI templates
- [x] `Implementation` type (name, version) for client/server info
- [x] `ServerCapabilities` type (prompts, resources, tools, logging, completions)
- [x] `ClientCapabilities` type
- [x] `InitializeRequest` / `InitializeResponse` types
- [x] `JSONRPCMessage` type alias for Request | Response | Notification
- [x] `go test ./core/protocol/...` 成功

## 備註

對齊 mark3labs/mcp-go/mcp/ 的 protocol types。Critical for protocol compliance。

## 執行紀錄 (2026-09-04 稽核)
- 已達成 10 項並打勾。
- **未竟事項**: 無
