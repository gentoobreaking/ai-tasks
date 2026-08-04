---
github_issue:
title: TUI Lifecycle (raw mode, alt screen, signal handlers)
type: pending
priority: high
status: done
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-03
updated: 2026-08-04
---

# T012 - TUI Lifecycle

## 目標
Implement `internal/tui/tui.go` per spec §6.1-6.2 and §8. Manages the terminal lifecycle: entering/exiting alternate screen buffer, raw mode via `golang.org/x/term`, focus tracking, and signal handlers (SIGINT/SIGTERM/SIGWINCH). Connects the ping engine to the TUI with the shared state model.

## 驗收標準
- [x] Enter alt-screen buffer (`CSI ? 1049 h`) + enable focus events (`CSI ? 1004 h`) + hide cursor on startup
- [x] Set raw mode on stdin via `golang.org/x/term.MakeRaw`
- [x] Register SIGINT/SIGTERM/SIGWINCH handlers
- [x] On exit: restore terminal state (alt screen exit, cursor show, raw mode off)
- [x] Ping-to-TUI data flow: ping loop → `pingAllOnce` → `onUpdate` callback → re-sort → `renderTUI` (§8.1)
- [x] Terminal resizing: redraw on SIGWINCH
- [x] Focus tracking: SIGFocusIn/SIGFocusOut via OSC 1014 (§6.1, §8.3)
- [x] First-run wizard on no config file found (§6.12)

## 備註
- TUI drives the ping loop directly in interactive mode; router server drives pings in background mode (§8)
- `FREMODEL_TUI_FORCE_CLEAR` env var forces full screen clear on render (§18)
