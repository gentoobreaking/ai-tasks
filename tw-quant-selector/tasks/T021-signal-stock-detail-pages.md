---
github_issue: https://github.com/openclawchen8-lgtm/openclaw-tasks/issues/655
title: 選股訊號與股票詳情頁面
type: feature
priority: high
status: done
assignee: gemini-3-flash-preview
created: 2026-05-26
updated: 2026-05-26
howto: |
  1. Create Signals page at frontend/src/pages/Signals.tsx
     - Full signal table with extra columns: rank_change (▲▼/NEW/OUT), consecutive_days
     - Top filter bar: date picker, strategy dropdown, ETF toggle, row height toggle, export
     - Pre-sorted by composite score descending, click header to re-sort
     - Date picker shows only available trading days
  2. Create StockDetail page at frontend/src/pages/StockDetail.tsx
     - Page header: stock_id + name + real-time price + daily change
     - Tab switcher: 因子分析 | 財務摘要 | 歷史入選紀錄
     - Factor Analysis tab: 4 sparklines (80px height, 52-week window, z-score -3~+3), radar chart, history timeline
     - Financials tab: PE/PB/ROE/gross_margin table, 8-quarter EPS bar chart, 24-month revenue YoY chart
     - History tab: table with selection date | rank | holding period | return
  3. Use recharts for bar/radar charts, lightweight-charts for sparklines where appropriate
  4. Fetch data from GET /api/v1/stock/{id} and /api/v1/signals/latest
---

# T021 - Signal & Stock Detail Pages

## 目標
實作選股訊號列表頁（/signals）與個股詳情頁（/signals/:stock_id），提供完整的因子分析與財務檢視能力。

## 驗收標準
### Signals 頁面
- [x] 選股排行表包含完整欄位：排名、排名變動（▲N/▼N/NEW/OUT）、股票代號+名稱、收盤價、今日漲跌、四因子橫條圖、綜合分數、連續入選天數、持倉狀態（● 持倉中 / ○ 未持倉，spec §3.2 選用欄位）
- [x] 欄位寬度符合 spec（排名48px / 股票160px / 收盤價88px / 漲跌80px / 各因子100px / 綜合80px / 持倉60px）
- [x] 排序圖示使用 ▲/▼/── 格式（spec §5.3），排序狀態保存於 URL query string
- [x] ETF 與個股以分組線隔開
- [x] 點擊股票列展開下方 inline 詳情列（顯示因子趨勢 + 近 30 日圖）
- [x] 鍵盤操作：↑↓ 移動焦點，Enter 展開，Esc 收起（spec §3.2）
- [x] 頂部篩選列：日期選擇器（僅可選交易日，灰化無資料日）、快捷選項（今日/昨日/上週五/上個月最後交易日，spec §5.3）、策略下拉（全部/動能/價值/品質/成長）、ETF 切換開關、行高切換（48px/36px）、匯出下拉選單（CSV/JSON）
- [x] 排名變動欄位正確顯示：正數用 bull 色 ▲，負數用 bear 色 ▼，新入選顯示 NEW
- [x] 排序可點擊欄標頭切換（單欄位，狀態保存於 URL query string）
- [x] 點擊股票列可導航至 `/signals/:stock_id`

### StockDetail 頁面
- [x] 頁首顯示：股票代號（mono）+ 名稱、即時價格、今日漲跌（顏色+▲/▼）
- [x] 因子分析分頁：4 個 sparkline 折線圖（各 80px 高，52 週範圍，z-score -3~+3），零線為 dashed 1px `--bg-border`，正數區填 bull-dim / 負數區填 bear-dim，當前值標示實心圓 r=4px。雷達圖顯示四因子總覽，歷史排名入選時間軸
- [x] 財務摘要分頁：PE/PB/殖利率/ROE/毛利率/負債比表格，近 8 季 EPS 長條圖，近 24 月營收 YoY 折線圖
- [x] 歷史入選紀錄分頁：表格含入選日期、排名、持有期間、期間報酬
- [x] 所有圖表正確使用顏色系統（因子色、漲跌色）

## 備註
- 參考 spec §3.3 Factor Panel、§4.2、§4.3
- 圖表函式庫：lightweight-charts（K線/sparkline）、recharts（長條/雷達圖）
