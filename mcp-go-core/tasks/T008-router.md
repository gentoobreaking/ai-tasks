---
github_issue: N/A
title: P1 - Router for Tool/Resource/Prompt Dispatch
type: feat
priority: high
status: done
updated: 2026-09-04
depends_on:
- T004
- T005
- T006
- T007
assignee: "pi with opencode"
created: 2026-09-04
updated: 2026-09-04
---

# T008 - P1: Router for Tool/Resource/Prompt Dispatch

## 目標

建立 `core/router/` 套件，處理 tool/resource/prompt dispatch。Request path 不得查 Feature Graph。

對應 spec §4.2 Core Interfaces (Router), agent_tasks TASK-014。

## 驗收標準

- [x] `Router` struct 提供: `RegisterTool`, `RegisterResource`, `RegisterPrompt`, `Dispatch` 方法
- [x] `Dispatch` 根據方法名稱路由到對應 handler
- [x] 支援 `tools/call`, `resources/read`, `prompts/get` 路由
- [x] 未知方法回傳 `MethodNotFoundError`
- [x] Request path 中不得查詢 Feature Graph (驗證: `grep` 不得出現 `featuregraph` 或 `registry.Resolve`)
- [x] `go test ./core/router/...` 成功

## 備註

Critical: request path 不能依賴 runtime feature resolution。對應 architecture §11 禁止 pattern。

## 執行紀錄 (2026-09-04 稽核)
- 驗收標準已核對 against 程式碼與測試（go build, go vet, go test 均通過）。
- 未發現缺口。
