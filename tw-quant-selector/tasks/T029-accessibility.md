---
github_issue: https://github.com/openclawchen8-lgtm/openclaw-tasks/issues/663
title: 無障礙設計
type: feature
priority: high
status: done
assignee: gemini-3-flash-preview
created: 2026-05-26
updated: 2026-05-26
howto: |
  1. Audit all pages for color contrast (main text 4.5:1, large >18px 3:1)
  2. Ensure ▲/▼ icons accompany ALL color-coded changes (not just daily change)
  3. Add keyboard navigation: Tab order, ↑↓ Enter Esc for tables
  4. Add Ctrl+B shortcut for sidebar toggle
  5. Add aria-label on all charts and data visualizations
  6. Add aria-live="polite" on dynamically updating content
  7. Add numeric alt text for factor bar charts
  8. Ensure all form elements have associated labels
  9. Test with screen reader (VoiceOver on macOS)
---

# T029 - Accessibility WCAG 2.1 AA

## 目標
確保全站符合 WCAG 2.1 AA 無障礙標準，支援螢幕閱讀器與鍵盤操作。

## 驗收標準
- [x] 色彩對比符合標準：主要文字 ≥ 4.5:1、大型文字（>18px）≥ 3:1
- [x] 所有使用顏色區分狀態（漲/跌）的地方，同時有 ▲/▼ 圖示輔助
- [x] 所有互動元素可用 Tab 鍵依序到達
- [x] 表格支援鍵盤操作：↑↓ 移動焦點、Enter 展開詳情、Esc 收起
- [x] Sidebar 展開/收合支援快捷鍵 Ctrl+B
- [x] 所有圖表有 `aria-label` 描述（如「2015至2025年策略累積報酬曲線，年化報酬18.4%，最大回撤28.3%」）
- [x] 因子橫條圖有對應的數值替代文字（不依賴視覺）
- [x] 動態更新內容使用 `aria-live="polite"`
- [x] 所有表單輸入有對應的 `<label>` 標籤
- [x] 在 macOS VoiceOver 下可正常操作所有頁面功能

## 備註
- 參考 spec §7 完整無障礙規格
- 建議使用 axe-core 或 Lighthouse 進行自動化檢測
