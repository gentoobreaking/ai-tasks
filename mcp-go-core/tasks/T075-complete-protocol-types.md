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

- [ ] Error codes: `parse_error (-32700)`, `invalid_request (-32600)`, `method_not_found (-32601)`, `invalid_params (-32602)`, `internal_error (-32603)`
- [ ] `PromptListParams`, `ResourceListParams`, `ToolListParams` request types
- [ ] `PromptListResult`, `ResourceListResult`, `ToolListResult` response types
- [ ] `ResourceTemplate` type for URI templates
- [ ] `Implementation` type (name, version) for client/server info
- [ ] `ServerCapabilities` type (prompts, resources, tools, logging, completions)
- [ ] `ClientCapabilities` type
- [ ] `InitializeRequest` / `InitializeResponse` types
- [ ] `JSONRPCMessage` type alias for Request | Response | Notification
- [ ] `go test ./core/protocol/...` 成功

## 備註

對齊 mark3labs/mcp-go/mcp/ 的 protocol types。Critical for protocol compliance。
