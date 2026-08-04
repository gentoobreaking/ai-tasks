---
github_issue:
title: 'Fix: TUI renderPending cross-goroutine race + dead TUI fields'
type: bugfix
priority: high
status: done
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-04
updated: 2026-08-04
---

# T038 - Fix: TUI renderPending race & config application

## 目標
Fix the P1 data race where `onPingUpdate()` (ping engine goroutine) writes `t.renderPending` while the main loop reads/writes it in `tick()` (`internal/tui/tui.go:141,151-160`) — unsynchronized, missed by tests because no test runs the TUI loop with live pings. Also apply `ScrollSortPauseMs` (currently hardcoded 1500ms in `navigate()`) and remove dead fields (`liveUpdateThrottle`, `lastLiveUpdate`).

## 驗收標準
- [ ] `renderPending` is an `atomic.Bool`; all reads/writes use Load/Store (onPingUpdate, tick, resize, handleInput paths)
- [ ] `ScrollSortPauseMs` from `tui.Config` stored on TUI and used by `navigate()` (default 1500ms when 0)
- [ ] Dead `liveUpdateThrottle` const and `lastLiveUpdate` field removed
- [ ] `Config.ForceClear` / `Config.ConfigPath` fields removed from `tui.Config` and main.go call site updated (config path already resolved inside config package)
- [ ] `go build`, `go vet`, `go test ./...` pass
- [ ] Unit test: `navigate()` sets `pauseUntil` ≈ `ScrollSortPauseMs` (construct TUI directly)

## 備註
- blurred 欄位只在主 goroutine 存取，不需改 atomic
