---
github_issue: https://github.com/gentoobreaking/ai-tasks/issues/724
title: 後端 factor-history API 接上 StockDetail 頁面
type: feature
priority: medium
status: done
assignee: OpenCode DeepSeek V4 Flash
created: 2026-05-28
updated: 2026-05-29
howto: |
  1. 檢視 `GET /api/v1/stock/{stock_id}/factor-history` 的回傳結構（stock_id、date、momentum、value、quality、growth）。
  2. 在 `StockDetail.tsx` 的「因子分析」tab 中，對每個因子調用此 API。
  3. 將歷史分數用 Sparkline 呈現（可沿用現有 SVG sparkline path 邏輯）。
  4. 載入期間顯示 SkeletonLoader variant="chart"。
  5. API 錯誤時顯示 EmptyState scenario="failed"。
---

# T074 - 後端 factor-history API 接上 StockDetail 頁面

## 目標
後端已實作 `GET /api/v1/stock/{stock_id}/factor-history` 端點，可回傳某個股的歷史因子分數時間序列，但前端從未呼叫此 API。將歷史因子分數接入 StockDetail 頁面的因子分析 tab，替代目前隨機產生的 SVG sparkline。

## 驗收標準
- [x] `StockDetail.tsx` 在 loading 後呼叫 `GET /api/v1/stock/{stock_id}/factor-history`
- [x] 因子分析 tab 的四個 sparkline（動能/價值/品質/成長）改用歷史真實資料繪製
- [x] SVG sparkline 路徑根據資料範圍縮放（動態 Y 軸區間）
- [x] 載入期間每個因子卡片顯示 SkeletonLoader variant="chart"
- [x] API 錯誤時顯示 `<EmptyState scenario="failed">`
- [x] 無歷史資料時顯示 `<EmptyState scenario="notrade">`
- [x] `client.ts` 新增 `fetchFactorHistory(stockId: string)` 方法
- [x] TypeScript 編譯無錯誤，`npm run build` 成功

## 備註
- 目前 sparkline 用 `Math.random()` 產生假資料，需改為真實資料
- 現有 sparkline-path CSS animation（stroke-dashoffset）可在真實資料上生效

## 實作紀錄 (2026-05-29)
### 後端改動
- `app.py:339-349` — 將 API 回傳格式從 flat rows（date/strategy/score）改為 pivot（date/momentum/value/quality/growth），前端可直接使用

### 前端改動
- `client.ts` — 新增 `FactorHistoryPoint` 型別（`{date, momentum, value, quality, growth}`）及 `fetchFactorHistory(stockId)` 方法
- `StockDetail.tsx` — 因子分析 tab 完全重寫：
  - 在 `useEffect` 中平行呼叫 `fetchStockDetail()` 與 `fetchFactorHistory()`
  - `historyLoading` 時顯示 4 個 `SkeletonLoader variant="chart"`
  - `historyError` 時顯示 `<EmptyState scenario="failed">`
  - `factorHistory.length === 0` 時顯示 `<EmptyState scenario="notrade">`
  - 新 `FactorSparklines` 元件用 `useMemo` 將歷史資料依因子拆出數值陣列（新→舊）
  - `buildSparklinePath(values)` 根據實際資料範圍做 Y 軸縮放（`h - pad - ((v - min) / range) * (h - 2 * pad)`），支援任意長度資料
  - 保留面積漸層、終點圓點、`sparkline-path` CSS stroke-dashoffset 動畫
- 移除舊 `generateSparklinePath()`（用 `Math.random()` 產生假資料）
