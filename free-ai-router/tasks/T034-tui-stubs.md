---
github_issue:
title: 'Fix: TUI stubs (search, target picker, settings screen)'
type: bugfix
priority: high
status: done
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-04
updated: 2026-08-04
---

# T034 - Fix: TUI search, target picker, settings screen

## 目標
Fix the P1 stub implementations: `/` search (`tui.go:321`), Enter target picker (`tui.go:377`), and settings screen (`tui.go:167` passes nil). Implement per spec §6.8, §6.13, §6.14.

## 驗收標準
- [ ] **Search** (`/`): search input mode with live filtering; Enter exits search (configures target if a match is selected), ESC clears query and exits; backspace edits (§6.8)
- [ ] **Target picker** (Enter): modal listing OpenCode/OpenClaw/Hermes/Pi with "Save + Launch" (if binary installed) and "Save config only"; calls `internal/targets` writers; shows success/failure (§6.14, §11)
- [ ] **Settings screen** (P): real provider list from config (name, ON/OFF, masked key, live test status), Space toggle, Enter edit key, T test ping, D delete, ESC/Q back (§6.13)
- [ ] RenderSettings accepts real provider data; config save on change
- [ ] Tests: search filtering, target picker writes config to temp dir, settings renders provider list

## 備註
- Target picker 需做 backup-before-write（targets 套件已實作）
- 金鑰編輯需 masked input
