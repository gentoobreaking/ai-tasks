---
github_issue: https://github.com/gentoobreaking/ai-tasks/issues/730
title: BacktestDetail 頁面接上後端回測明細 API
type: feature
priority: low
status: done
assignee: OpenCode DeepSeek V4 Flash
created: 2026-05-28
updated: 2026-05-29
howto: |
  1. `GET /api/v1/backtest/{run_id}/detail` 回傳該次回測的完整結果（績效指標、逐筆交易、持倉變動）。
  2. `BacktestDetail.tsx` 目前僅為 placeholder（stub），需改為完整頁面。
  3. 載入期間顯示 SkeletonLoader variant="card"。
  4. 績效指標用 StatCard 呈現，交易明細用表格呈現。
  5. 從前端 `/backtest/{runId}` 路由傳入 runId 參數。
---

# T076 - BacktestDetail 頁面接上後端回測明細 API

## 目標
`BacktestDetail.tsx` 目前是 stub 頁面（僅顯示佔位文字），後端已有 `GET /api/v1/backtest/{run_id}/detail` 回傳完整回測明細。將 API 接入實現回測結果檢視。

## 驗收標準
- [x] `client.ts` 新增 `fetchBacktestDetail(runId: string)` 方法
- [x] `BacktestDetail.tsx` 載入時呼叫 `GET /api/v1/backtest/{run_id}/detail`
- [x] 頁面顯示：績效指標（總報酬率、年化報酬、MDD、交易次數、換手率）
- [x] 使用 `<StatCard>` 顯示各項績效指標
- [x] 交易明細以表格呈現（日期、股號、買/賣、股數、價格、成交值、權重）
- [x] 載入期間顯示 `<SkeletonLoader variant="card">` + `<SkeletonLoader variant="table">`
- [x] API 錯誤時顯示 `<EmptyState scenario="failed">`
- [x] TypeScript 編譯無錯誤，`npm run build` 成功

## 備註
- 需確認後端 `/api/v1/backtest/{run_id}/detail` 的回傳結構與前端型別一致
- 持倉變動歷史可用展開行方式呈現
- 勝率無法從 `backtest_positions` 計算（無買賣配對 P&L），改為顯示交易次數

## 實作紀錄 (2026-05-29)
### 後端改動
- `app.py:440-482` — `get_backtest_detail` 增強：
  - metrics 新增 `turnover`（來自 `backtest_runs.turnover`）與 `total_trades`（來自 `backtest_positions` COUNT）
  - 新增 trades 陣列，從 `backtest_positions` 查詢（trade_date / stock_id / action / shares / price / value / weight）

### 前端改動
- `client.ts` — 新增 `BacktestTrade` 與 `BacktestDetail` 型別，及 `fetchBacktestDetail(runId)`
- `BacktestDetail.tsx` — 從 stub 改為完整頁面：
  - 載入中：SkeletonLoader card + metrics grid + table
  - 錯誤：EmptyState scenario="failed" 含重新載入
  - 無資料：EmptyState scenario="notrade"
  - Header：返回按鈕、runId 顯示、建立時間/區間
  - 7 個 StatCard：總報酬率、年化報酬(CAGR)、最大回撤(MDD)、夏普比率、卡瑪比率、交易次數、換手率
  - 交易明細表格：日期 / 股號（可點擊進 StockDetail）/ 買賣（彩色標示）/ 股數 / 價格 / 成交值 / 權重
- `BacktestDetail.module.css` — 新建：header、metricsGrid、tradeTable、stockLink、actionBuy/actionSell 樣式
