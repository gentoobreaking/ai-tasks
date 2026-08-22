---
github_issue: ""
title: "TUI accessibility: color-blind safe palette and status icons"
type: pending
priority: high
status: pending
depends_on: []
assignee: "OpenCode with DeepSeek V4 Flash"
created: "2026-08-22"
updated: "2026-08-22"
---

# T083 - TUI accessibility: color-blind safe palette and status icons

## 目標
修正 TUI 顏色方案以支援色盲使用者，並在關鍵狀態欄位同時顯示圖示 + 顏色（雙重編碼），確保無障礙存取。

## 驗收標準
- [ ] 替換 `internal/tui/render.go` 的 lipgloss 風格，使用色盲安全調色盤（推薦：Okabe-Ito 或 ColorBrewer Safe）
- [ ] Status 欄位：🟢 up / 🔴 down / 🟡 pending / 🟠 timeout / ⚫ noauth — 同時顯示 emoji + 顏色
- [ ] Tier 欄位：S+/S/A+/A/A-/B+/B/C 使用形狀差異（如 ◆/◇/■/□/●/○）輔助色彩
- [ ] 搜尋高亮、選中行、標題列皆符合 WCAG AA 對比度（≥4.5:1）
- [ ] 新增 `--no-color` / `--no-emoji` flag 供終端機不支援時降級
- [ ] 單元測試驗證對比度（可用 `github.com/lucasb-eyer/go-colorful` 計算）

## 備註
- 修改位置：`internal/tui/render.go`、`internal/tui/table.go`、`internal/tui/tui.go`（flag 解析）
- 現行依賴 `charmbracelet/lipgloss`，需檢查其支援的顏色空間
- 建議定義 `AccessibleStyle` struct 集中管理，避免硬編碼散落
- 測試時使用 `TERM=dumb` 或 `NO_COLOR=1` 環境變數驗證降級