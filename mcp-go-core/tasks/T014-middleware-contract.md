---
github_issue: N/A
title: P2 - Middleware Contract (Logging + Recovery)
type: feat
priority: medium
status: done
updated: 2026-09-04
depends_on:
- T015
- T009
assignee: "pi with opencode"
created: 2026-09-04
updated: 2026-09-04
---

# T014 - P2: Middleware Contract (Logging + Recovery)

## 目標

建立 `core/middleware/`，定義 middleware abstraction，實作 logging 和 recovery。

對應 feature_graph_spec F31/F32/F35, architecture §22 Middleware, agent_tasks TASK-040。

## 驗收標準

- [x] `Middleware` type: `func(Handler) Handler`
- [x] `Logger` interface: Debug, Info, Warn, Error
- [x] `Logging()` middleware 實現，支援 request/response logging
- [x] `Recovery()` middleware 實現，catch panic and return internal error
- [x] Middleware order preserved (Server.Use 保持順序)
- [x] Disabled middleware 不會在 runtime branch (production build 無 if-check)
- [x] `go test ./core/middleware/...` 成功

## 備註

Metrics / tracing 可以先建立 descriptor，不要求完整 implementation。Server.Use(Logging(), Recovery()) pattern.

## 執行紀錄 (2026-09-04 稽核)
- 驗收標準已核對 against 程式碼與測試（go build, go vet, go test 均通過）。
- 未發現缺口。
