---
github_issue: ""
title: "CLI discoverability: add doctor, providers, models subcommands"
type: pending
priority: high
status: pending
depends_on: []
assignee: "OpenCode with DeepSeek V4 Flash"
created: "2026-08-22"
updated: "2026-08-22"
---

# T082 - CLI discoverability: add doctor, providers, models subcommands

## 目標
新增三個高價值的 CLI 子命令，讓使用者無需進入 TUI 即可診斷、查看 provider 狀態、列出模型。同時將隱藏的 `--best` flag 升級為一級子命令 `freemodel best`。

## 驗收標準
- [ ] `freemodel doctor`：健康檢查 — 檢查配置檔語法、API key 可用性、網路連線、ping 引擎狀態，輸出結構化報告
- [ ] `freemodel providers`：列出所有 provider，顯示 key 狀態（env/config/none）、啟用狀態、模型數量、可發現性
- [ ] `freemodel models`：非互動式列出所有模型，支援 `--tag coding`、`--provider groq`、`--tier S+` 過濾，輸出表格或 JSON
- [ ] `freemodel best`：將現有 `--best` 邏輯遷移為子命令，保留原 flag 相容性
- [ ] 所有新命令支援 `--json` 輸出格式供腳本使用
- [ ] `freemodel --help` 顯示新命令並分組顯示（Core / Discovery / Config / Debug）

## 備註
- 修改位置：`internal/cli/flags.go`（解析）、`internal/cli/` 新增 `doctor.go`、`providers.go`、`models.go`
- `doctor` 可複用 `internal/router/server.go` 的 `/api/status` 邏輯
- `providers` 可複用 `internal/providers/providers.go` 的 `GetAllProviders()`
- 注意 CLI 解析器現行架構：positional args 優先於 flags