---
github_issue: N/A
title: P5 - Generated Router
type: feat
priority: medium
status: done
updated: 2026-09-04
depends_on:
- T030
assignee: "pi with opencode"
created: 2026-09-04
updated: 2026-09-04
---

# T034 - P5: Generated Router

## 目標

生成 `.mcp/generated/router.go` 靜態路由 dispatch。

## 驗收標準

- [ ] `Dispatch(ctx, name, req) Response` switch-based router
- [ ] 只包含 enabled tools 的 routes
- [ ] Unknown tool 回傳 UnknownTool(name)
- [ ] `go test ./internal/generator/...` 成功

## 備註

Generated router uses switch statement for static dispatch — no map lookup at runtime。
