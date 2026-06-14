---
github_issue: https://github.com/openclawchen8-lgtm/openclaw-tasks/issues/726
title: MarketStatus 元件接入側欄
type: feature
priority: medium
status: done
assignee: OpenCode DeepSeek V4 Flash
created: 2026-05-28
updated: 2026-05-28
howto: |
  1. `MarketStatus.tsx` 已實作台股開收盤時間判斷（`getMarketStatus()`）。
  2. 在 `Sidebar.tsx` 或 `Layout.tsx` 標頭區加入 `<MarketStatus />`。
  3. 顯示開盤/收盤/休市狀態與對應圖示，並定時更新（每 60 秒）。
  4. Dashboard 標頭也可同步顯示。
---

# T071 - MarketStatus 元件接入側欄

## 目標
`MarketStatus.tsx` 已實作台股交易日/時間判斷，但從未被任何頁面匯入。將市場狀態顯示在側欄或頁面標頭，讓使用者一眼知道台股是否開盤中。

## 驗收標準
- [x] `Sidebar.tsx`、`Layout.tsx`、`Dashboard.tsx` 皆已匯入 `<MarketStatus />` 並顯示
- [x] 顯示多種狀態：🟢 交易中 / 🟡 盤前 / 🟠 收盤中 / ⚫ 已收盤 / 🔴 休市中
- [x] 狀態文字包含下次開盤時間提示（非交易時段顯示，格式：`・X小時後`）
- [x] 組件每 60 秒自動更新狀態
- [x] 不影響現有版面佈局（Sidebar 使用 `compact` 模式）
- [x] TypeScript 編譯無錯誤

## 備註
- `format.ts` 中的 `getMarketStatus()` 目前僅被 `MarketStatus.tsx` 使用，MarketStatus 接入後 `format.ts` 即為有用途
- 可考慮在 Dashboard 標頭日期旁也顯示市場狀態
