---
github_issue: N/A
title: P5 - Generated Build Info
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

# T036 - P5: Generated Build Info

## 目標

生成 `.mcp/generated/buildinfo.go` 包含 build metadata。

## 驗收標準

- [x] `FrameworkVersion`, `BuildProfile`, `FeatureLockHash`, `BuildTimestamp`, `GitCommit` variables
- [x] Values injected at build time via ldflags
- [x] `go test ./internal/generator/...` 成功

## 備註

Build info enables reproducibility verification。

## 執行紀錄 (2026-09-04 稽核)
- 驗收標準已核對 against 程式碼與測試（go build, go vet, go test 均通過）。
- 未發現缺口。
