---
github_issue:
title: TUI Colors & Primitives
type: pending
priority: high
status: done
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-03
updated: 2026-08-04
---

# T013 - TUI Colors & Primitives

## 目標
Implement `internal/tui/colors.go` (ANSI color constants and helpers) and `internal/tui/primitives.go` (UI primitives: table cells, bars, blocks, status dots) per spec §6.3-6.5. These provide the low-level rendering primitives used by the main render engine.

## 驗收標準
- [x] `internal/tui/colors.go`: ANSI color constants (green, yellow, red, orange, dim, etc.) and color helper functions
- [x] Status dots per spec §6.5:
  - `*` green = up (HTTP 200)
  - `!` yellow = no auth (401)
  - `!` red = forbidden (403)
  - `~` orange = rate limited (429)
  - `#` red = unavailable (503)
  - `?` red = not found (404)
  - `o` red = timeout
  - `x` red = down (5xx)
  - `.` dim = pending/no data
- [x] Table cell primitive with truncation to column width (§6.4)
- [x] Progress bar primitive for visual indicators
- [x] Block primitive for bordered sections (settings screen, help overlay)
- [x] Provider status tags: READY (green bg), NO KEY (yellow bg), WRONG KEY (red bg), OFF (dim bg) (§6.6)

## 備註
- Columns: #, Tier, Provider, Model, Ctx, Bench, Avg, Lat, Up%, Verdict (§6.4)
- Tier color-coding: S+ → S → A+ → ... → C (§6.4)
