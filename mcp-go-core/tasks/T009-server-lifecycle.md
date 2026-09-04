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

- [ ] `NewServer(opts ...Option) *Server` 函數
- [ ] `Server.AddTool(tool Tool)` 方法
- [ ] `Server.AddResource(resource Resource)` 方法
- [ ] `Server.AddPrompt(prompt Prompt)` 方法
- [ ] `Server.Run(ctx context.Context) error` 方法
- [ ] Lifecycle: Create → Configure → Initialize → Start → Running → Shutdown → Cleanup
- [ ] 支援 `context.Context` 取消
- [ ] `Shutdown` 必須 graceful (等待 in-flight requests 完成)
- [ ] minimal MCP server 可以啟動與 shutdown
- [ ] `go test ./core/server/... ./core/lifecycle/...` 成功

## 備註

Shutdown timeout 可配置 (default 10s)。對應 architecture §4.2 Server interface。
