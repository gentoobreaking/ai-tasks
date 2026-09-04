---
github_issue: N/A
title: P3 - Unified Transport Interface with Session Management
type: feat
priority: medium
status: pending
depends_on: []
assignee: "pi with opencode"
created: 2026-09-04
updated: 2026-09-04
---

# T074 - Unified Transport Interface with Session Management

## 目標

抽象 `modules/transport/{stdio,http,sse}` 為統一的 `Transport` interface，加入 session management 和 streaming support。借鑒 mark3labs/mcp-go 的 SSE/HTTP transport session routing 設計。

## 驗收標準

- [ ] `Transport` interface: `Serve(ctx context.Context, handler Handler) error`、`Close(ctx context.Context) error`
- [ ] Session ID generation: `NewSessionID() string`
- [ ] `GET /sse` endpoint returns event stream (SSE)
- [ ] `POST /message` endpoint accepts JSON-RPC messages
- [ ] `POST /message?sessionId=xxx` routing to specific session
- [ ] HTTP transport 不 import stdio 或 sse
- [ ] SSE transport 不 import stdio 或 http
- [ ] `go test ./modules/transport/...` 成功
- [ ] transport sessions 支援 graceful shutdown

## 備註

借鑒 mark3labs/mcp-go server/sse.go 的 session management pattern。Transport layer 應支援 concurrent sessions。
