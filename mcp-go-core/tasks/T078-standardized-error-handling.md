---
github_issue: N/A
title: P1 - Standardized Error Handling
type: feat
priority: high
status: done
depends_on:
- T004
assignee: "pi with opencode"
created: 2026-09-04
updated: 2026-09-04
---

# T078 - Standardized Error Handling

## 目標

擴充 `core/mcperror/` 對齊 JSON-RPC 2.0 標準 error codes，確保 error response 格式一致。

## 驗收標準

- [ ] `ErrCodeParseError = -32700`
- [ ] `ErrCodeInvalidRequest = -32600`
- [ ] `ErrCodeMethodNotFound = -32601`
- [ ] `ErrCodeInvalidParams = -32602`
- [ ] `ErrCodeInternalError = -32603`
- [ ] `NewError(code int, message string, cause error) *Error`
- [ ] `Error.JSONRPCError() JSONRPCError` returns `{"code": int, "message": string}`
- [ ] `Error.Error()` 包含 code 和 message
- [ ] `Error.Is(target error) bool` for errors.Is()
- [ ] `Error.As(target any) bool` for errors.As()
- [ ] `go test ./core/mcperror/...` 成功
- [ ] `TestParseError_InvalidParams_InnerError`: 驗證標準 error codes

## 備註

Critical for protocol compliance。Error type should be compatible with mark3labs/mcp-go's error handling.
