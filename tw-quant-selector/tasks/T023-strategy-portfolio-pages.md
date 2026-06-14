---
github_issue: https://github.com/gentoobreaking/ai-tasks/issues/657
title: 策略設定與投組追蹤頁面
type: feature
priority: medium
status: done
assignee: gemini-3-flash-preview
created: 2026-05-26
updated: 2026-05-26
howto: |
  1. Create Strategy page at frontend/src/pages/Strategy.tsx
     - Weight sliders: 4 strategy sliders (0-100%, step 5%), auto-normalize to sum=100%
     - Per-strategy parameter inputs (lookback, thresholds, weights) fetched from GET /api/v1/strategies/config
     - Universe filter section: include ETF toggle, min market cap, exclude financial toggle
     - [Apply] button shows confirmation modal with impact preview
     - [Reset] button returns to defaults
     - Preview area: "若套用此設定，今日選股將有 N 檔變動"
  2. Create Portfolio page at frontend/src/pages/Portfolio.tsx
     - Holdings table: stock_id, name, shares, cost, current price, P&L ($$ + %), weight
     - Trade history table: date, action (buy/sell), stock_id, shares, price
     - Portfolio summary: total value, cash balance, daily P&L, total P&L
     - Use color coding: P&L positive = bull, negative = bear
  3. Wire up to POST /api/v1/strategies/run and /api/v1/backtest/run as needed
---

# T023 - Strategy Configurator & Portfolio Tracker Pages

## 目標
實作策略設定頁（/strategy）與投組追蹤頁（/portfolio），提供策略權重微調與模擬持倉管理。

## 驗收標準
### Strategy 頁面
- [x] 四策略權重滑桿（0-100%，步進 5%），調整時自動補足或鎖定（鎖定其他三支滑桿）使總和 = 100%
- [x] 各策略的可調參數依 `GET /api/v1/strategies/config` 動態渲染（lookback_long、max_pe、roe_weight…）
- [x] 篩選條件區塊：ETF 開關、最低市值輸入、排除金融股開關
- [x] 套用前顯示確認 Modal，說明「若套用此設定，今日選股將有 N 檔變動」
- [x] 重設按鈕可恢復預設值
- [x] 調整權重時，即時預覽影響範圍

### Portfolio 頁面
- [x] 持倉表格顯示各持股的：股號、名稱、股數、成本、現價、損益（金額+百分比）、權重
- [x] 損益顏色正確（正=bull、負=bear），帶 ▲/▼ 輔助圖示
- [x] 交易歷史表格：日期、買/賣、股號、股數、價位
- [x] 投組摘要列：總市值、現金餘額、當日損益、總損益

## 備註
- 參考 spec §3.5 Strategy Configurator、§4.5（Portfolio 為每日使用頁面，簡潔為上）
- 策略權重調整後可連動發送 POST 至 `/api/v1/strategies/run`
