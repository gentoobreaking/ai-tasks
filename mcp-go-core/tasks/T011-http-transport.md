---
github_issue: N/A
title: P2 - HTTP Transport Module
type: feat
priority: medium
status: done
updated: 2026-09-04
depends_on:
- T015
- T009
assignee: "pi with opencode"
created: 2026-09-04
updated: 2026-09-04
---

# T011 - P2: HTTP Transport Module

## 目標

建立 `modules/transport/http/`，實現 Streamable HTTP transport。

對應 feature_graph_spec F12, architecture §23 Transport API, agent_tasks TASK-022。

## 驗收標準

- [ ] `Transport` interface: `Serve(ctx context.Context, handler Handler) error`
- [ ] HTTP transport 支援 Streamable HTTP 協定
- [ ] 處理 `POST /mcp` 初始化, `GET /mcp` 事件流
- [ ] JSON-RPC over HTTP
- [ ] HTTP server 獨立 package boundary (不 import stdio 或 sse)
- [ ] `go test ./modules/transport/http/...` 成功

## 備註

HTTP module must not import stdio or sse. Each transport must be independently buildable。

## 執行紀錄 (2026-09-04 稽核)
- 驗收標準已核對 against 程式碼與測試（go build, go vet, go test 均通過）。
- 未發現缺口。
