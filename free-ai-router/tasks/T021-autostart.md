---
github_issue:
title: Autostart (macOS launchctl, Linux XDG)
type: pending
priority: medium
status: pending
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-03
updated: 2026-08-03
---

# T021 - Autostart

## 目標
Implement `internal/cli/autostart.go` per spec §12.2. Provides start-on-login for macOS, Linux, and Windows via platform-native mechanisms.

## 驗收標準
- [ ] `freemodel autostart --install` — enable start-on-login
- [ ] `freemodel autostart --start` — start now
- [ ] `freemodel autostart --uninstall` — disable autostart
- [ ] `freemodel autostart --status` — check autostart status
- [ ] macOS: creates `~/Library/LaunchAgents/com.freemodel.router.plist` via `launchctl` (§12.2)
- [ ] Linux: creates `~/.config/autostart/freemodel-router.desktop` (XDG) (§12.2)
- [ ] Windows: registers with Task Scheduler or Startup folder (§12.2)
- [ ] Platform-specific startup command uses `freemodel start`

## 備註
- Only macOS and Linux supported per spec; Windows is listed but minimal
