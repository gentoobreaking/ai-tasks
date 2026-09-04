---
github_issue: N/A
title: P5 - Generated Server Bootstrap
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

# T033 - P5: Generated Server Bootstrap

## 目標

生成 `.mcp/generated/server.go` 建立 server 並呼叫 Configure。

## 驗收標準

- [x] `NewServer(opts ...core.Option) *core.Server` 函數
- [x] Server 初始化後呼叫 `Configure(s)` for static module composition
- [x] `go test ./internal/generator/...` 成功

## 備註

Generated server.go is the entry point that ties static composition together。

## 執行紀錄 (2026-09-04 稽核)
- 驗收標準已核對 against 程式碼與測試（go build, go vet, go test 均通過）。
- 未發現缺口。
