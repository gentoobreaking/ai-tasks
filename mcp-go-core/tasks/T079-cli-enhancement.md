---
github_issue: N/A
title: P3 - CLI Enhancement (Builder Patterns & Commands)
type: feat
priority: medium
status: pending
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

- [ ] `mcp-go-core init --name myapp --profile development`
- [ ] `mcp-go-core build --output dist/server --profile production`
- [ ] `mcp-go-core run --addr localhost:8080 --transport stdio`
- [ ] `mcp-go-core generate --dry-run` (show what would be generated)
- [ ] `mcp-go-core verify --binary dist/server`
- [ ] CLI 使用 builder pattern 建立 server
- [ ] `mcp-go-core --version` display version info
- [ ] `go test ./cmd/mcp-go-core/...` 成功
- [ ] `go build ./cmd/mcp-go-core/` 成功

## 備註

CLI enhancement 可結合 T038 (builder pipeline) 與 T103 (server builder API)。Command structure should follow mark3labs/mcp-go's cobra.Command patterns.
