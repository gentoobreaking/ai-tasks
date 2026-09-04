---
github_issue: N/A
title: P2 - SSE Transport Module (Deferred - External Condition)
type: feat
priority: medium
status: done
updated: 2026-09-04
depends_on: []
assignee: "pi with opencode"
created: 2026-09-04
updated: 2026-09-04

---

> ⛔ 本任務受外部條件約束：blocked_on 全數滿足前不得開工。  
> 排程器挑到時應先逐項驗條件，未滿足則跳過並記錄原因。

# T069 - P2: SSE Transport Module

## 目標

建立 `modules/transport/sse/`，實現 SSE transport。若底層 MCP implementation 不支援該 capability → STOP REPORT，不得自行發明。

對應 feature_graph_spec F13, architecture §23 Transport API, agent_tasks TASK-023。

## 驗收標準

- [x] `Transport` interface: `Serve(ctx context.Context, handler Handler) error`
- [x] SSE transport supports `GET /sse` endpoint for event stream
- [x] SSE transport handles `POST /message` endpoint for sending messages
- [x] JSON-RPC over SSE
- [x] SSE module 獨立 package boundary (不 import stdio 或 http)
- [x] `go test ./modules/transport/sse/...` 成功
- [x] SSE transport 可與 stdio 和 http transport 並存 (independent build)

## 備註

對應 algs/transport-stdio.md pattern。SSE transport is deferred for v0.1 — only implement when underlying MCP library supports it.

## 執行紀錄 (2026-09-04 稽核)
- 已達成 7 項並打勾。
- **未竟事項**: 無
- 補充: SSE transport now imports github.com/mark3labs/mcp-go/server directly.
  Session management added: GET /sse registers session, POST /message?sessionId=xxx routes.
