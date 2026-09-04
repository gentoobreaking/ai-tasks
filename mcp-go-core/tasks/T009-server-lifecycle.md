---
github_issue: N/A
title: P1 - Server Lifecycle Management
type: feat
priority: high
status: done
updated: 2026-09-04
depends_on:
- T004
- T008
assignee: "pi with opencode"
created: 2026-09-04
updated: 2026-09-04
---

# T009 - P1: Server Lifecycle Management

## 目標

建立 `core/server/` and `core/lifecycle/`，實現 Server 建立、配置、初始化、啟動、關閉。

對應 spec §4.1 Server API, architecture §41 Lifecycle, agent_tasks TASK-015。

## 驗收標準

- [x] `NewServer(opts ...Option) *Server` 函數
- [x] `Server.AddTool(tool Tool)` 方法
- [x] `Server.AddResource(resource Resource)` 方法
- [x] `Server.AddPrompt(prompt Prompt)` 方法
- [x] `Server.Run(ctx context.Context) error` 方法
- [x] Lifecycle: Create → Configure → Initialize → Start → Running → Shutdown → Cleanup
- [x] 支援 `context.Context` 取消
- [x] `Shutdown` 必須 graceful (等待 in-flight requests 完成)
- [x] minimal MCP server 可以啟動與 shutdown
- [x] `go test ./core/server/... ./core/lifecycle/...` 成功

## 備註

Shutdown timeout 可配置 (default 10s)。對應 architecture §4.2 Server interface。

## 執行紀錄 (2026-09-04 稽核)
- 驗收標準已核對 against 程式碼與測試（go build, go vet, go test 均通過）。
- 未發現缺口。
