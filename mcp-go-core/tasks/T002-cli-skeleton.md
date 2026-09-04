---
github_issue: N/A
title: P0 - CLI Skeleton with All Commands
type: feat
priority: high
status: done
updated: 2026-09-04
depends_on: []
assignee: "pi with opencode"
created: 2026-09-04
updated: 2026-09-04
---

# T002 - P0: CLI Skeleton with All Commands

## 目標

建立 `mcp-go-core` CLI skeleton，所有 commands 可stub，但 `--help` 必須顯示完整命令列表。

對應 spec §10 CLI，agent_tasks TASK-002。

## 驗收標準

- [x] `cmd/mcp-go-core/main.go` 建立
- [x] CLI 支援 subcommands: `init`, `analyze`, `generate`, `build`, `test`, `benchmark`, `doctor`, `overview`, `clean`
- [x] `mcp-go-core --help` 顯示所有 subcommands
- [x] 每個 subcommand 至少顯示 `--help`（可用 stub）
- [x] `go build ./cmd/mcp-go-core/` 成功

## 備註

初期 command 可為 stub。對應 architecture §29 CLI。

## 執行紀錄 (2026-09-04 稽核)
- 驗收標準已核對 against 程式碼與測試（go build, go vet, go test 均通過）。
- 未發現缺口。
