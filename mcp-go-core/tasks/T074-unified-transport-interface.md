---
github_issue: N/A
title: P3 - Unified Transport Interface with Session Management
type: feat
priority: medium
status: done
depends_on: []
assignee: "pi with opencode"
created: 2026-09-04
updated: 2026-09-04
---

# T074 - Unified Transport Interface with Session Management

## 目標

抽象 `modules/transport/{stdio,http,sse}` 為統一的 `Transport` interface，加入 session management 和 streaming support。借鑒 mark3labs/mcp-go 的 SSE/HTTP transport session routing 設計。

## 驗收標準

- [x] `Transport` interface: `Serve(ctx context.Context, handler Handler) error`、`Close(ctx context.Context) error`
- [x] Session ID generation: `NewSessionID() string`
- [x] `GET /sse` endpoint returns event stream (SSE)
- [x] `POST /message` endpoint accepts JSON-RPC messages
- [x] `POST /message?sessionId=xxx` routing to specific session
- [x] HTTP transport 不 import stdio 或 sse
- [x] SSE transport 不 import stdio 或 http
- [x] `go test ./modules/transport/...` 成功
- [x] transport sessions 支援 graceful shutdown

## 備註

借鑒 mark3labs/mcp-go server/sse.go 的 session management pattern。Transport layer 應支援 concurrent sessions。

## 執行紀錄 (2026-09-04 稽核)
- 已達成 8 項並打勾。
- **未竟事項**: 無
