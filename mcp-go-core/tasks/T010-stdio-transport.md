---
github_issue: N/A
title: P2 - Stdio Transport Module
type: feat
priority: high
status: done
updated: 2026-09-04
depends_on:
- T015
- T009
assignee: "pi with opencode"
created: 2026-09-04
updated: 2026-09-04
---

# T010 - P2: Stdio Transport Module

## 目標

建立 `modules/transport/stdio/`，實現 MCP over stdio transport。

對應 feature_graph_spec F11, architecture §23 Transport API, algs/transport-stdio.md, agent_tasks TASK-021。

## 驗收標準

- [x] `Transport` interface: `Serve(ctx context.Context, handler Handler) error`
- [x] Stdio transport reads from `os.Stdin` (newline-delimited JSON)
- [x] Stdio transport writes to `os.Stdout` (newline-delimited JSON)
- [x] Support MCP JSON-RPC 2.0 消息格式
- [x] Handle `initialize`, `tools/list`, `tools/call`, `shutdown`, `exit`
- [x] Graceful shutdown on SIGINT/SIGTERM
- [x] `go test ./modules/transport/stdio/...` 成功
- [x] minimal example 使用 stdio 成功

## 備註

Stdio transport is the minimal viable transport for MCP. Algorithm details in algs/transport-stdio.md。

## 執行紀錄 (2026-09-04 稽核)
- 驗收標準已核對 against 程式碼與測試（go build, go vet, go test 均通過）。
- 未發現缺口。
