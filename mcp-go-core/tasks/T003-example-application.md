---
github_issue: N/A
title: P0 - Example Application with Stdio Transport
type: feat
priority: high
status: done
updated: 2026-09-04
depends_on: []
assignee: "pi with opencode"
created: 2026-09-04
updated: 2026-09-04
---

# T003 - P0: Example Application with Stdio Transport

## 目標

建立 `examples/minimal/` 示例應用程式，包含 1 個 MCP server、1 個 tool、stdio transport。

對應 spec §11 Feature Lock，agent_tasks TASK-003。

## 驗收標準

- [x] `examples/minimal/` 目錄建立
- [x] 包含 `main.go`、`mcp.yaml`、`go.mod`
- [x] Server 註冊至少 1 個 tool
- [x] 使用 stdio transport
- [x] `go build ./examples/minimal/` 成功
- [x] `go test ./examples/minimal/` 成功

## 備註

對應 architecture §35 Application/Framework Separation。Application code 位於 `cmd/` 和 `internal/tools/`。

## 執行紀錄 (2026-09-04 稽核)
- 驗收標準已核對 against 程式碼與測試（go build, go vet, go test 均通過）。
- 未發現缺口。
