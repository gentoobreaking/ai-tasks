---
github_issue: https://github.com/openclawchen8-lgtm/openclaw-tasks/issues/700
title: URL Deep State Management
type: feature
priority: medium
status: done
assignee: OpenCode DeepSeek V4 Pro + DeepSeek V4 Flash
created: 2026-05-27
updated: 2026-05-28
howto: |
  1. Signals 頁面：將 date/strategy/sort/dir/etf/stock 參數同步到 URL（?date=...&strategy=...&sort=...）。
  2. Backtest 頁面：將 compare/zoom 參數同步到 URL。
  3. StockDetail 頁面：將 tab 參數同步到 URL。
  4. 頁面首次載入從 URL 還原狀態。
  5. 無效參數靜默忽略，使用預設值。
  6. 用戶偏好（密度）存 localStorage 而非 URL。
---

# T057 - URL Deep State Management

## 目標
讓所有頁面的可分享狀態反映在 URL 中，支援 deep link 分享、瀏覽器前進/後退導航、以及書籤功能。

## 驗收標準
- [x] `/signals` 支援 URL 參數：strategy/sort/dir/etf/stock
- [x] `/backtest/:run_id` 支援 URL 參數：compare/zoom
- [x] `/signals/:stock_id` 支援 URL 參數：tab
- [x] 使用者操作（排序/篩選/ETF切換/展開行）→ 即時更新 URL（replace）
- [x] 資料自動刷新 → 不更新 URL
- [x] 頁面首次載入 → 從 URL 還原所有狀態
- [x] 無效參數 → 靜默忽略，使用預設值
- [x] 用戶偏好（密度/行高）存 localStorage，不放 URL
- [x] Signals 頁面已有部分實作（sort/dir），補全 etf/stock 並改用 functional setter 保留其他參數

## 備註
- 參考 spec §13.1–13.2
- 注意不要引入過多 re-render（URL 更新不應觸發 API 重 fetch）
