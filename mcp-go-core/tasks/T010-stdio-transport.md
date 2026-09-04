---
github_issue: N/A
title: P2 - Stdio Transport Module
type: feat
priority: high
status: pending
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

- [ ] `Transport` interface: `Serve(ctx context.Context, handler Handler) error`
- [ ] Stdio transport reads from `os.Stdin` (newline-delimited JSON)
- [ ] Stdio transport writes to `os.Stdout` (newline-delimited JSON)
- [ ] Support MCP JSON-RPC 2.0 消息格式
- [ ] Handle `initialize`, `tools/list`, `tools/call`, `shutdown`, `exit`
- [ ] Graceful shutdown on SIGINT/SIGTERM
- [ ] `go test ./modules/transport/stdio/...` 成功
- [ ] minimal example 使用 stdio 成功

## 備註

Stdio transport is the minimal viable transport for MCP. Algorithm details in algs/transport-stdio.md。
