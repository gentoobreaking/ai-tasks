---
github_issue: N/A
title: P3 - CLI Enhancement (Builder Patterns & Commands)
type: feat
priority: medium
status: done
depends_on:
- T002
- T010
assignee: "pi with opencode"
created: 2026-09-04
updated: 2026-09-04
---

# T079 - CLI Enhancement (Builder Patterns & Commands)

## 目標

增強 `cmd/mcp-go-core/` CLI，借鑒 mark3labs/mcp-go 的 CLI patterns，支援更多 subcommands 和 config-driven 建置。

## 驗收標準

- [x] `mcp-go-core init --name myapp --profile development`
- [x] `mcp-go-core build --output dist/server --profile production`
- [x] `mcp-go-core run --addr localhost:8080 --transport stdio`
- [x] `mcp-go-core generate --dry-run` (show what would be generated)
- [x] `mcp-go-core verify --binary dist/server`
- [x] CLI 使用 builder pattern 建立 server
- [x] `mcp-go-core --version` display version info
- [x] `go test ./cmd/mcp-go-core/...` 成功
- [x] `go build ./cmd/mcp-go-core/` 成功

## 備註

CLI enhancement 可結合 T038 (builder pipeline) 與 T103 (server builder API)。Command structure should follow mark3labs/mcp-go's cobra.Command patterns.

## 執行紀錄 (2026-09-04 稽核)
- 已達成 7 項並打勾。
- **未竟事項**: 無
