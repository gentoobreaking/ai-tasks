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

- [x] `Dispatch(ctx, name, req) Response` switch-based router
- [x] 只包含 enabled tools 的 routes
- [x] Unknown tool 回傳 UnknownTool(name)
- [x] `go test ./internal/generator/...` 成功

## 備註

Generated router uses switch statement for static dispatch — no map lookup at runtime。

## 執行紀錄 (2026-09-04 稽核)
- 驗收標準已核對 against 程式碼與測試（go build, go vet, go test 均通過）。
- 未發現缺口。
