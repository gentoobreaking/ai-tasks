---
github_issue:
title: 'Fix: SIGWINCH must resize TUI, not quit'
type: bugfix
priority: high
status: done
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-04
updated: 2026-08-04
---

# T048 - Fix: terminal resize kills the TUI

## 目標
`Run()` registers `SIGWINCH` (`internal/tui/tui.go:108-124`) but the select treats every signal the same: `case <-sigCh: t.quit = true`. Resizing the terminal window terminates the TUI. `t.resize()` is only called once at startup.

## 驗收標準
- [ ] Signal dispatch extracted to `handleSignal(sig os.Signal)`: `SIGWINCH` → `t.resize()`, anything else (SIGINT/SIGTERM) → `t.quit = true`
- [ ] Select uses `case sig := <-sigCh: t.handleSignal(sig)`
- [ ] Unit test: `handleSignal(SIGWINCH)` triggers resize path (renderPending set); `handleSignal(SIGINT)` sets quit
- [ ] `go build`, `go test ./...` pass

## 備註
- resize 已在 resize() 內設定 renderPending，focus 回復後即重新繪製
