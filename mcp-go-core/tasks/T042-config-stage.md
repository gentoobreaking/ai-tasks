---
github_issue: N/A
title: P6 - Config Stage
type: feat
priority: medium
status: done
updated: 2026-09-04
depends_on:
- T038
assignee: "pi with opencode"
created: 2026-09-04
updated: 2026-09-04
---

# T042 - P6: Config Stage

## 目標

實作 ConfigStage: load mcp.yaml, validate schema。

## 驗收標準

- [x] 讀取 mcp.yaml (profile, transport, security, runtime, observability, storage)
- [x] Schema validation before continuing
- [x] `Config` struct populated in BuildContext
- [x] Invalid config → fail with actionable error
- [x] `go test ./internal/builder/...` 成功

## 備註

Stage 01 of build pipeline。mcp.yaml schema must be validated。

## 執行紀錄 (2026-09-04 稽核)
- 驗收標準已核對 against 程式碼與測試（go build, go vet, go test 均通過）。
- 未發現缺口。
