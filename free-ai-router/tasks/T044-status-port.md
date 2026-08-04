---
github_issue:
title: 'Fix: status command honors FREMODEL_PORT'
type: bugfix
priority: low
status: done
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-04
updated: 2026-08-04
---

# T044 - Fix: status.go hardcoded port

## 目標
`RunStatus` (`internal/cli/status.go:39`) hardcodes port 7352 in the printed server URL, ignoring `FREMODEL_PORT`.

## 驗收標準
- [ ] `RunStatus` resolves port from `FREMODEL_PORT` env (fallback 7352) and prints it
- [ ] `go build` passes

## 備註
- 與 config 套件的 `config.GetPort()` 同源，避免重複實作
