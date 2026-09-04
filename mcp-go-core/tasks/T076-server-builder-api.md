---
github_issue: N/A
title: P2 - Server Builder API
type: feat
priority: medium
status: done
depends_on:
- T009
assignee: "pi with opencode"
created: 2026-09-04
updated: 2026-09-04
---

# T076 - Server Builder API

## 目標

在 `core/server/` 添加 builder pattern API，類似 mark3labs/mcp-go 的 `server.New().WithTools().WithPrompts().WithResources().Build()`。

## 驗收標準

- [x] `Builder` struct 提供 fluent API
- [x] `NewBuilder() *Builder`
- [x] `Builder.WithName(name string) *Builder`
- [x] `Builder.WithTool(tool Tool) *Builder`
- [x] `Builder.WithResource(r Resource) *Builder`
- [x] `Builder.WithPrompt(p Prompt) *Builder`
- [x] `Builder.WithTransport(t Transport) *Builder`
- [x] `Builder.WithMiddleware(mw ...Middleware) *Builder`
- [x] `Builder.Build() (*Server, error)`
- [x] `Builder.MustBuild() *Server` (panics on error)
- [x] `go test ./core/server/...` 成功

## 備註

Builder pattern 提升開發者體驗。Builder 必須確保 lifecycle 順序正確 (AddTool → Configure → Start)。

## 執行紀錄 (2026-09-04 稽核)
- 已達成 10 項並打勾。
- **未竟事項**: 無
