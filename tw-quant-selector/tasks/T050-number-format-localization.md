---
github_issue: https://github.com/openclawchen8-lgtm/openclaw-tasks/issues/693
title: Number Format & Localization Utility
type: feature
priority: high
status: done
assignee: OpenClaw MiniMax M2.7 / 碼農1號 + DeepSeek V4 Flash
created: 2026-05-27
updated: 2026-05-28
howto: |
  1. 實作 `formatNumber(value, opts)` 函式，支援 price/percent/score/market_cap/volume/ratio/days 格式。✅ 已完成
  2. 實作 `colorize(value, type)` 函式，回傳 text + className + ariaLabel。✅ 已完成
  3. 實作日期格式函式（完整日期/緊縮日期/相對時間）。✅ 已完成
  4. 實作市場狀態標記元件（交易中/收盤中/已收盤/休市中）。✅ 已完成
  5. 將所有頁面的數字渲染改為經由 formatNumber / colorize。✅ 已完成
  6. 處理邊界案例：NaN、Infinity、-0、null、loading。✅ 已完成
---

# T050 - Number Format & Localization Utility

## 目標
實作統一的數字格式化函式庫與台灣在地化處理，涵蓋所有金融數字格式、載入中/錯錯誤/邊界案例、顏色化輸出、日期與市場時間顯示。

## 驗收標準
- [x] `formatNumber()` 支援 7 種 type（price/percent/score/market_cap/volume/ratio/days），符合 spec §5.1
- [x] 台股股價格式：<10 三位小數、10–1000 兩位小數、>=1000 整數
- [x] 台灣縮寫：萬/億/兆，位置：234.5億、1.23萬張
- [x] 載入中回傳骨架屏（非 0 或 placeholder）
- [x] 邊界案例：NaN/Infinity/-0/null 回傳 `—`，無限大回傳 `∞`
- [x] `colorize()` 回傳 `{text, className, ariaLabel}`，正/負/零各有對應
- [x] 日期格式：完整 ISO+星期、緊縮 MM/DD、相對 HH:mm
- [x] 市場狀態元件：交易中/收盤中/已收盤/休市中，含 last updated 時間
- [x] 所有頁面數字渲染統一經由新的格式化函式

## 子任務（頁面整合）

### T050-A - StockDetail.tsx 數字格式統一 ✅
- [x] 第 56 行：`lastPrice.toFixed(2)` → `formatNumber(lastPrice, { type: 'price' })`
- [x] 第 116 行：殖利率 `(v.dy * 100).toFixed(2)%` → `formatNumber(v.dy, { type: 'percent' })`
- [x] 第 131 行：營收 `f.rev.toLocaleString()` → `formatNumber(f.rev, { type: 'market_cap' })`
- [x] 第 133-135 行：ROE/GM/DE 格式化
- [x] 第 150 行：月營收 `r.rev.toLocaleString()`
- [x] 第 152 行：年增率 `(r.yoy * 100).toFixed(2)%`

### T050-B - Dashboard.tsx 數字格式統一 ✅
- [x] 第 280 行：`item.score.toFixed(2)` → `formatNumber(item.score, { type: 'score' })`

### T050-C - Signals.tsx 數字格式統一 ✅
- [x] 第 300 行：`item.score.toFixed(2)` → `formatNumber(item.score, { type: 'score' })`

### T050-D - Backtest.tsx 數字格式統一 ✅
- [x] 第 149 行：歷史列表 CAGR 格式化
- [x] 第 152 行：Sharpe 格式化
- [x] 第 472 行：MetricCell 內部改用 formatNumber

### T050-E - Monitor.tsx 數字格式統一 ✅
- [x] 第 121 行：`ds.count.toLocaleString()` → 統一格式

### T050-F - Portfolio.tsx 數字格式統一 ✅
- [x] 第 242 行：損益百分比格式化
- [x] 第 280-288 行：交易歷史表格數字格式化
- [x] 第 312 行：權重百分比格式化
- [x] 第 421-428 行：持倉明細數字格式化

## 實作進度

| 項目 | 狀態 | 檔案 |
|------|------|------|
| formatNumber() | ✅ 完成 | `frontend/src/utils/format.ts` |
| colorize() | ✅ 完成 | `frontend/src/utils/format.ts` |
| formatDate() | ✅ 完成 | `frontend/src/utils/format.ts` |
| getMarketStatus() | ✅ 完成 | `frontend/src/utils/format.ts` |
| MarketStatus 元件 | ✅ 完成 | `frontend/src/components/MarketStatus.tsx` |
| StatCard 整合 | ✅ 完成 | `frontend/src/components/StatCard.tsx` |
| Backtest tooltip 整合 | ✅ 完成 | `frontend/src/pages/Backtest.tsx` |
| StockDetail.tsx 整合 | ✅ 完成 | T050-A |
| Dashboard.tsx 整合 | ✅ 完成 | T050-B |
| Signals.tsx 整合 | ✅ 完成 | T050-C |
| Backtest.tsx 完整整合 | ✅ 完成 | T050-D |
| Monitor.tsx 整合 | ✅ 完成 | T050-E |
| Portfolio.tsx 整合 | ✅ 完成 | T050-F |

## Build 驗證

```bash
cd /Users/claw/Projects/tw-quant-selector/frontend && npm run build
```

✓ built in 361ms — 所有頁面編譯成功，無 TypeScript 錯誤

## 備註
- 參考 spec §5.1–5.3（數字格式）與 §14.1–14.3（在地化）
- 舊的 `format.ts` 工具已擴充，原有函式保留以保持向後相容
