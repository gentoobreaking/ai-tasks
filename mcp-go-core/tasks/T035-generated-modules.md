---
github_issue: N/A
title: P5 - Generated Modules Composition
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

# T035 - P5: Generated Modules Composition

## 目標

生成 `.mcp/generated/modules.go` 包含 static module Configure calls。

## 驗收標準

- [ ] Only enabled modules appear in import block
- [ ] `modules.ConfigureAll(server)` 禁止
- [ ] `GEN-003` test: direct module.Configure calls
- [ ] `go test ./internal/generator/...` 成功

## 備註

This is the core of "static composition" — the primary optimization mechanism。

## 執行紀錄 (2026-09-04 稽核)
- 驗收標準已核對 against 程式碼與測試（go build, go vet, go test 均通過）。
- 未發現缺口。
