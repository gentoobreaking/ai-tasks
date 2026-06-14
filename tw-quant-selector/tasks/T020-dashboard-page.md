---
github_issue: https://github.com/gentoobreaking/ai-tasks/issues/654
title: 儀表板頁面
type: feature
priority: high
status: done
assignee: gemini-3-flash-preview
created: 2026-05-26
updated: 2026-05-26
howto: |
  1. Create Dashboard page component at frontend/src/pages/Dashboard.tsx
  2. Implement StatCard component (spec §3.1): label, value, delta, variants (default/highlight/alert)
  3. Fetch data from GET /api/v1/dashboard and GET /api/v1/signals/latest
  4. Display KPI row: 今日選股數, 入選ETF數, 組合分數, 大盤概況
  5. Implement SignalTable component (spec §3.2) with: rank, stock ID+name, close price, daily change, 4 factor mini-bars, composite score
  6. Factor mini-bars: bar width = z-score mapped to 0~100%, color per strategy, hover tooltip
  7. Implement 因子貢獻摘要 (bar chart, 4 factors)
  8. Implement 本週換股異動 section (+/- list)
  9. Wire up TanStack Query for API calls with skeleton loading states
  10. CSV export button wired up
---

# T020 - Dashboard Page (今日總覽)

## 目標
實作首頁 Dashboard，顯示今日選股總覽，包括 KPI 卡片、選股排行表、因子貢獻摘要與換股異動。

## 驗收標準
- [x] 頁面標頭顯示「今日總覽」+ 當前日期（含星期幾）+「台股收盤」+ [重新整理] 按鈕（spec §4.1）
- [x] KPI 卡片行可正確顯示：今日選股數、入選ETF數、組合分數、大盤概況（來自 API）
- [x] StatCard 支援 `format` prop（'number'/'percent'/'currency'/'raw'）與 error 狀態（顯示「—」+ 錯誤色，spec §3.1）
- [x] StatCard 最小尺寸 180px x 120px，variant 選項（default/highlight/alert）有正確視覺差異
- [x] 選股排行表 SignalTable 正確渲染，欄位含：排名、股票（代號+名稱）、收盤價、今日漲跌、動能/價值/品質/成長迷你橫條圖、綜合分數
- [x] 欄位寬度符合 spec：排名 48px / 股票 160px / 收盤價 88px / 今日漲跌 80px / 各因子 100px / 綜合分數 80px
- [x] ETF 與個股以分組線隔開（spec §3.2）
- [x] 點擊股票列可展開下方 inline 詳情列（因子趨勢 + 近 30 日圖，spec §3.2）
- [x] 因子迷你橫條圖顏色正確（紫/翠/琥珀/天藍），hover tooltip 顯示精確數值，超過 +2σ 顯示滿格+發光效果
- [x] 今日漲跌欄位正確使用 `+`/`-` 前綴與 bull/bear 顏色，超過 ±5% 的背景色高亮（bull-dim/bear-dim）
- [x] 表格可點擊欄標頭排序（單欄位，排序圖示 ▲ 升序 / ▼ 降序 / ── 未排序，狀態存於 URL query string）
- [x] 鍵盤操作：↑↓ 移動焦點，Enter 展開詳情，Esc 收起
- [x] 每頁 20 筆，不分頁
- [x] 點擊股票列可導航至 `/signals/:stock_id`
- [x] 因子貢獻摘要橫條圖正確顯示 4 個因子權重
- [x] 本週持倉損益區塊：「+2.4% vs 0050 +1.1% 超額 +1.3%」（spec §4.1 佈局圖）
- [x] 本週換股異動列出 + 買入 / - 賣出清單
- [x] 載入中顯示骨架屏（skeleton loading），無旋轉 spinner
- [x] 首屏優先：不須捲動即可看到入選數量、前 10 筆排行、有無告警
- [x] 無資料時顯示空狀態說明（spec §5.2）
- [x] 匯出 CSV 按鈕可直接下載

## 備註
- 參考 spec §4.1 頁面佈局、§3.1 StatCard、§3.2 SignalTable
- 首屏優先：入選數量、整體分數、前 10 筆排行
