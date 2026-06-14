---
github_issue: https://github.com/gentoobreaking/ai-tasks/issues/662
title: 響應式設計框架
type: feature
priority: high
status: done
assignee: gemini-3-flash-preview
created: 2026-05-26
updated: 2026-05-26
howto: |
  1. Define CSS custom properties for breakpoints (not using Tailwind per spec §9.1)
  2. Implement responsive sidebar: auto-collapse at md (768px)
  3. Create Dashboard simplified mobile view
  4. Create SignalTable mobile variant: hide 4 factor columns, show 4 colored dots
  5. Backtest page: redirect to desktop-message at sm breakpoint
  6. Strategy page: show block message at sm breakpoint
  7. Test all breakpoints in browser dev tools
---

# T028 - Responsive Design Framework

## 目標
實作全站響應式設計框架，以桌面為主、行動為輔（spec §6.1），確保所有頁面在四種斷點下均有合理的顯示。

## 驗收標準
- [x] CSS 斷點已定義：xl ≥ 1440px（全版面+多欄）、lg ≥ 1024px（標準桌面+側欄展開）、md ≥ 768px（Tablet+側欄收合）、sm < 768px（手機單欄簡化）
- [x] Sidebar 在 md 以下自動收合（僅顯示圖示），點擊漢堡選單可展開
- [x] 手機版 Dashboard 可正常瀏覽（簡化版本）
- [x] 手機版選股表格只顯示：排名、股票、綜合分數、今日漲跌，因子欄位改為 4 個小色塊（顏色深淺代表分數強弱）
- [x] 手機版點擊表格列可展開完整詳情
- [x] 手機版顯示回測分析頁面時顯示「請在桌面環境使用回測分析」的提示，不載入圖表
- [x] 手機版顯示策略設定頁面時顯示「請在桌面環境設定策略」的提示，不載入表單
- [x] 所有元件在 ≤ 640px 寬度下無 overflow / 破版
- [x] 手機版字體大小不小於 spec 定義，確保可讀性

## 備註
- 參考 spec §6 完整響應式規格、§6.2 手機版限制
- 此任務應在所有頁面完成後最後執行，確保無 regressions
