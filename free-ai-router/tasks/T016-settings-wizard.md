---
github_issue:
title: Settings Screen & First-Run Wizard
type: pending
priority: high
status: done
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-03
updated: 2026-08-04
---

# T016 - Settings Screen & First-Run Wizard

## 目標
Implement the interactive settings screen (`P` key) and first-run wizard per spec §6.12-6.13. Provides provider toggle, inline API key editing with masked input, live test pings, and auto-opens signup pages for providers without keys.

## 驗收標準
- [x] Settings screen layout (§6.13):
  - Provider list: ON/OFF toggle, masked API key (`nvapi-...****`), live test status `[342ms 200 ✓]`
  - Providers with no key show `(no key)`
  - Navigation: ↑↓, Enter to edit key, Space to toggle, T to test ping, D to delete, ESC/Q to back
- [x] Inline API key editing with bullet/masked characters
- [x] Live test ping for selected provider
- [x] Auto-open signup page when navigating to a provider with no key
- [x] First-run wizard (§6.12):
  - Welcome screen with ASCII art
  - Per-provider: "Open browser + enter key" / "Enter key manually" / "Skip"
  - Auto-open signup URL for selected provider
  - Key format validation (prefix check)
  - Save config and start TUI
- [x] Config auto-save on exit

## 備註
- Multi-account key pool is managed via CLI commands, not TUI (§19 Non-Goals #3)
