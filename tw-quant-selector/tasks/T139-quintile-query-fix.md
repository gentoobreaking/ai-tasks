---
github_issue: 
title: "分層報酬後端 Query 修復 + 前端說明"
type: pending
priority: medium
status: done
assignee: "Hermes with DeepSeek V4 Pro"
created: 2026-06-15
updated: 2026-06-15
---

# T139 - 分層報酬後端 Query 修復 + 前端說明

## 目標
修復 `quintile-returns` API 永遠回傳空陣列的問題，並在前端加入說明文字。

## 根因
原 query `LEAD(dp.close, 20) OVER (PARTITION BY s.stock_id, s.strategy ORDER BY s.signal_date)` 有兩個問題：
1. LEAD 以 signal_date 排序，但 signals 只有 ~6 天 → LEAD(20) 永遠 NULL
2. signal_date 必須跟 daily_prices.trade_date 完全對齊，但兩者覆蓋不一致

## 修復
- `app.py`：改用 `WITH fut AS (SELECT LEAD(close,20) OVER (PARTITION BY stock_id ORDER BY trade_date) FROM daily_prices)` 再 JOIN signals — 讓 LEAD(20) 以 daily_prices 自身日期排序
- `FactorResearch.tsx`：標題改為「因子分層報酬（T+20 日）」，加入說明文字解釋分層邏輯，無資料時顯示涵蓋不足提示

## 驗收標準
- [x] Query 改用 daily_prices 自身的 LEAD(20)，不再依賴 signal_date 排序
- [x] 前端顯示分層報酬說明文字
- [x] 無資料時顯示原因（daily_prices 涵蓋不足）

## 更動檔案
- `src/tw_quant_selector/api/app.py`
- `frontend/src/pages/FactorResearch.tsx`

## 備註
- 分層報酬實際要有資料，仍需補全全市場 daily_prices 歷史（排程分批或 FinMind token）
- 已完成 Apr-Jun daily_prices backfill (~14K rows) + May signals backfill，但 TWSE rate limit 導致覆蓋僅 ~400 檔
- 下次繼續：用 `backfill_daily_prices.py --stocks` 分批補完剩餘股票
