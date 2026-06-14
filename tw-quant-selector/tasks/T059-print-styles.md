---
github_issue: https://github.com/gentoobreaking/ai-tasks/issues/702
title: Print Styles
type: feature
priority: low
status: done
assignee: OpenCode DeepSeek V4 Flash
created: 2026-05-27
updated: 2026-05-29
howto: |
  1. 回測詳情頁加入 [列印報告] 按鈕。
  2. 實作 print CSS：深色轉白底、隱藏 UI 元件、漲跌顏色調整、圖表反色、分頁控制。
  3. 報告結構：第一頁=指標+淨值曲線、第二頁=年度報酬+回撤。
  4. 表格跨頁重複 thead、強制分頁控制。
---

# T059 - Print Styles

## 目標
實作列印樣式系統，讓使用者可以透過 [列印報告] 按鈕或 Cmd+P 輸出可讀性高的 A4 回測報告。

## 驗收標準
- [x] 回測詳情頁右上角 [列印報告] 按鈕（T079 實作）
- [x] print CSS：背景白底、文字深色、隱藏 sidebar/nav/按鈕、圖表 invert 反色（T079 實作）
- [x] 漲跌顏色依台股慣例：漲=深紅 #8b0000 / 跌=深綠 #006400
- [x] 列印結構：第一頁=績效指標、後續=交易明細（page-break 控制）
- [x] 表格跨頁重複 thead、metric-grid page-break-inside: avoid
- [x] A4 直向、邊界 20mm
- [x] status: done

## 備註
- 參考 spec §16.1–16.3
- CSS 寫在 `@media print` 區塊中
