---
github_issue:
title: TUI Input Handling
type: pending
priority: high
status: done
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-03
updated: 2026-08-04
---

# T015 - TUI Input Handling

## 目標
Implement `internal/tui/input.go` per spec §6.8. Handles all keyboard shortcuts and escape sequence parsing in raw mode. Single goroutine reads stdin and dispatches commands.

## 驗收標準
- [x] Key dispatch for all shortcuts (§6.8):
  - ↑↓ / j k — navigate models
  - PgUp/PgDn — page up/down
  - g — jump to top
  - G — jump to bottom
  - / — toggle search (Enter configures target, ESC clears)
  - Enter — configure current model for a target agent
  - A — quick API key add/change
  - R — edit API key for rejected provider
  - P — settings screen
  - T — cycle tier filter
  - C — toggle coding-only filter
  - W / X — decrease/increase ping interval
  - N — cycle provider filter
  - 0-9 — sort by column (second press reverses)
  - ? — help overlay
  - q / Ctrl+C — quit
- [x] Escape sequence parsing for arrow keys, Page Up/Down, Home/End
- [x] Search input with live filtering
- [x] Single goroutine for stdin reading in raw mode (§16.1)
- [x] Dispatch to main thread for state mutations that require re-render

## 備註
- Enter on a model opens target picker modal (§6.14)
