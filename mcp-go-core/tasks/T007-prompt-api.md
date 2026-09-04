---
github_issue: N/A
title: P1 - Prompt API
type: feat
priority: high
status: done
updated: 2026-09-04
depends_on:
- T004
assignee: "pi with opencode"
created: 2026-09-04
updated: 2026-09-04
---

# T007 - P1: Prompt API

## 目標

建立 `core/prompt/` 套件，提供 Prompt interface。

對應 spec §4.2 Core Interfaces (Prompt), agent_tasks TASK-013。

## 驗收標準

- [x] `Prompt` interface 包含: `Name() string`, `Description() string`, `Get(ctx, req) (PromptResponse, error)`
- [x] `PromptRequest` struct with name 和 arguments
- [x] Prompt name 驗證: 非空字串
- [x] `go test ./core/prompt/...` 成功

## 備註

Prompt 是 MCP 協定的可選 capability。Core 不得依賴具體 Prompt 實現。

## 執行紀錄 (2026-09-04 稽核)
- 驗收標準已核對 against 程式碼與測試（go build, go vet, go test 均通過）。
- 未發現缺口。
