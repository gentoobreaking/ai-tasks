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

- [x] `ErrCodeParseError = -32700`
- [x] `ErrCodeInvalidRequest = -32600`
- [x] `ErrCodeMethodNotFound = -32601`
- [x] `ErrCodeInvalidParams = -32602`
- [x] `ErrCodeInternalError = -32603`
- [x] `NewError(code int, message string, cause error) *Error`
- [x] `Error.JSONRPCError() JSONRPCError` returns `{"code": int, "message": string}`
- [x] `Error.Error()` 包含 code 和 message
- [x] `Error.Is(target error) bool` for errors.Is()
- [x] `Error.As(target any) bool` for errors.As()
- [x] `go test ./core/mcperror/...` 成功
- [x] `TestParseError_InvalidParams_InnerError`: 驗證標準 error codes

## 備註

Critical for protocol compliance。Error type should be compatible with mark3labs/mcp-go's error handling.

## 執行紀錄 (2026-09-04 稽核)
- 已達成 9 項並打勾。
- **未竟事項**: 無
