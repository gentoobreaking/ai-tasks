---
github_issue: N/A
title: P1 - Tool API with Type-Safe Handler
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

# T005 - P1: Tool API with Type-Safe Handler

## 目標

建立 `core/tool/` 套件，提供 typed Tool interface 和 generic helper。不得依賴 reflection 作為主要 dispatch。

對應 spec §4.2 Core Interfaces (Tool), agent_tasks TASK-011。

## 驗收標準

- [ ] `Tool` interface 包含: `Name() string`, `Description() string`, `InputSchema() Schema`, `Handler() ToolHandler`
- [ ] `ToolHandler` type: `func(context.Context, Request) (Response, error)`
- [ ] `NewTool[T any, R any]()` generic helper 建立 (developer convenience)
- [ ] Tool name 驗證: 非空字串
- [ ] InputSchema 支援 JSON Schema 格式
- [ ] `go test ./core/tool/...` 成功

## 備註

Generated/runtime representation 必須保持高效。Generic API 是 developer convenience，generated code 應轉換為 efficient execution path。
