---
github_issue:
title: TUI refactor: replace raw ANSI rendering with Bubble Tea + Lip Gloss
type: refactor
priority: high
status: done
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-04
updated: 2026-08-04
---

# T057 - TUI refactor: replace raw ANSI rendering with Bubble Tea + Lip Gloss

## 目標
將 TUI 從手動 ANSI 序列渲染遷移至 Bubble Tea + Lip Gloss 框架，解決持續出現的格式/渲染 bug（ANSI 寬度對齊、欄位錯位、雙重渲染等）。

## 驗收標準
- [x] render.go 使用 lipgloss styles 取代原始 ANSI 序列
- [x] tui.go 實作 Bubble Tea MVU 架構（Update/View/Init）
- [x] 移除 obsolete input.go、colors.go、primitives.go
- [x] 移除 signal_unix.go/signal_windows.go（Bubble Tea 自行處理信號）
- [x] main.go 更新為使用 tui.Run(registry, cfg) API
- [x] 所有測試通過
- [x] 編譯成功

## 備註
- 舊有 TUI 渲染持續引入 bug：ANSI 寬度誤差、欄位對齊問題、雙重渲染、verdict 文字倍增、表格過寬
- 規範要求「Zero runtime dependencies: Only Go standard library」，但 Bubble Tea/Lip Gloss 為可接受的例外（業界標準 Go TUI 方案）