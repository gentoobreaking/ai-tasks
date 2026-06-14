---
github_issue: https://github.com/openclawchen8-lgtm/openclaw-tasks/issues/727
title: Signals / Dashboard 表格改用 BaseTable 統一元件
type: refactor
priority: medium
status: done
assignee: OpenCode DeepSeek V4 Flash
created: 2026-05-28
updated: 2026-05-28
howto: |
  1. `BaseTable.tsx` 已實作泛用表格：排序點擊、鍵盤導覽、展開行、可及性、loading skeleton。
  2. 將 `Signals.tsx` 和 `Dashboard.tsx` 中自訂的 `<table>` 結構改為 `<BaseTable>`。
  3. 各 column 定義使用 `BaseTable` 的 `columns` prop（含 sortKey、render 函數）。
  4. `BaseTable` 已整合 `SkeletonLoader` 和 `EmptyState`，移除頁面中重複的 loading/empty 邏輯。
  5. 保留頁面特有的樣式（SignalRow、ETF 分隔線等）透過 `render` 函數注入。
---

# T072 - Signals / Dashboard 表格改用 BaseTable 統一元件

## 目標
`BaseTable.tsx` 已定義完整的泛用表格元件（排序、鍵盤導覽、展開行、可及性），但 `Signals.tsx` 和 `Dashboard.tsx` 各自重寫了幾乎相同的表格邏輯。改為共用 `BaseTable` 減少重複程式碼。

## 驗收標準
- [x] `Signals.tsx` 的選股訊號表格改用 `<BaseTable>` 渲染
- [x] `Dashboard.tsx` 的今日入選個股表格改用 `<BaseTable>` 渲染
- [x] 排序功能透過 `BaseTable` 的 `onSortChange` 回呼正確運作
- [x] 鍵盤導覽（上下鍵/Enter/Esc）透過 `BaseTable` 內部 keyboard handler 正確運作
- [x] ETF 分隔線保留（透過 `groupLabel` prop 判斷）
- [x] `SkeletonLoader` 和 `EmptyState` 整合不受影響（BaseTable 內建 loading skeleton，頁面保留 error EmptyState）
- [x] TypeScript 編譯無錯誤，`npm run build` 成功

## 備註
- `BaseTable` 目前有匯入 `SkeletonLoader` 和 `EmptyState`，確認這些依賴與目前的 skeleton/empty 方案一致
- `BaseTable.module.css` 的樣式需檢查是否與 Signals.module.css / Dashboard.module.css 相容
