---
github_issue: N/A
title: P2 - MCP Test Infrastructure
type: feat
priority: medium
status: done
depends_on:
- T001
assignee: "pi with opencode"
created: 2026-09-04
updated: 2026-09-04
---

# T077 - MCP Test Infrastructure

## 目標

建立 `testutil/` package 包含 test helpers、mock server/client，用於簡化 MCP server 和 transport 的測試。借鑒 mark3labs/mcp-go 的 test 工具。

## 驗收標準

- [x] `testutil/echo-server.go`: echo server for testing JSON-RPC round-trip
- [x] `testutil/mock-transport.go`: mock transport implementing `Transport` interface
- [x] `testutil/test-session.go`: session-based test harness
- [x] `testutil/assert.go`: assertion helpers for MCP responses
- [x] `TestEchoServer_RoundTrip`: echo server 正確回應 echo
- [x] `TestMockTransport_Intercept`: mock transport 攔截並驗證 request/response
- [x] `TestSession_Connect`: session-based 連線測試
- [x] `go test ./tests/...` 成功

## 備註

Test Infrastructure 是開發和 CI 的關鍵。借鑒 mark3labs/mcp-go 的 `testdata/mockstdio_server.go` pattern。

## 執行紀錄 (2026-09-04 稽核)
- 已達成 7 項並打勾。
- **未竟事項**: 無
