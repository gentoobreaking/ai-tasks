---
github_issue:
title: TUI Rendering Engine
type: pending
priority: high
status: pending
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-03
updated: 2026-08-03
---

# T014 - TUI Rendering Engine

## 目標
Implement `internal/tui/render.go` per spec §6.3-6.11. The core ANSI rendering engine that draws the full-screen model table with headers, provider status tags, search bar, footer keybindings, settings screen, help overlay, and target picker modal.

## 驗收標準
- [ ] Full-screen table render with alt-screen buffer
- [ ] Top bar: provider status tags (READY/NO KEY/WRONG KEY/OFF) (§6.6)
- [ ] Model search bar (§6.3): `Model Search /query_ 842/1024 models`
- [ ] Selected model info row: model ID, SWE score, coding flag
- [ ] Table columns: # (rank, `>` prefix for selected), Tier, Provider, Model, Ctx, Bench, Avg latency, Lat (latest), Up%, Verdict (§6.4, spec §6.3)
- [ ] Column widths match spec: #=5, Tier=6, Provider=13, Model=34, Ctx=7, Bench=6, Avg=8, Lat=8, Up%=6, Verdict=16
- [ ] Sorting by columns 0-9 with reverse on second press; default priority sort: status → tier → avg latency → uptime → provider → model (§6.9)
- [ ] Tier filter cycling via `T` key: All → S+ → S → A+ → ... → C (§6.8)
- [ ] Provider filter cycling via `N` key: All → NIM → OpenRouter → ... (§6.8)
- [ ] Render throttling: ~30fps (33ms interval) with trailing render (§6.11)
- [ ] Auto-sort pause: 1500ms (configurable via `scrollSortPauseMs`) when user is navigating (§6.10)
- [ ] Live update: individual ping completion triggers throttled render (300ms); completed round triggers full re-sort render (§8.2)
- [ ] Blurred rendering: defer renders when terminal loses focus; fire single deferred render on focus-in (§8.3)
- [ ] Help overlay (`?`): full-screen overlay with all keyboard shortcuts, sort columns, tier definitions, verdict descriptions (§6.15)

## 備註
- `tui_render_test.go`: mock terminal captures ANSI output, verifies table layout (§13.2)
- `FREMODEL_STRICT_RENDER_AUTH=1` panics on non-authoritative render (testing) (§18)
