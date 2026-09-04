---
github_issue: N/A
title: P6 - Compile Stage
type: feat
priority: medium
status: done
updated: 2026-09-04
depends_on:
- T039
assignee: "pi with opencode"
created: 2026-09-04
updated: 2026-09-04
---

# T043 - P6: Compile Stage

## 目標

實作 CompileStage: execute Go build with profile-specific optimization flags。

## 驗收標準

- [x] Default: `go build ./cmd/server`
- [x] Production: `go build -trimpath -ldflags="-s -w" ./cmd/server`
- [x] CGO_ENABLED=0 default
- [x] Flags configurable
- [x] Binary output to dist/server
- [x] `BUILD-001` test: dist/server exists and executable
- [x] `go test ./internal/builder/...` 成功

## 備註

Optimization flags must be configurable and benchmarked。

## 執行紀錄 (2026-09-04 稽核)
- 驗收標準已核對 against 程式碼與測試（go build, go vet, go test 均通過）。
- 未發現缺口。
