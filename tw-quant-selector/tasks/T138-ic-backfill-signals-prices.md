---
github_issue: 
title: "IC 分析歷史資料 Backfill — signals + daily_prices 補全"
type: pending
priority: high
status: done
assignee: "Hermes with DeepSeek V4 Pro"
created: 2026-06-15
updated: 2026-06-15
---

# T138 - IC 分析歷史資料 Backfill — signals + daily_prices 補全

## 目標
IC 分析圖表只有一個點，因為 signals 資料太少且 daily_prices 覆蓋不完整。補全上週（6/8~6/12）的 signals 與 daily_prices。

## 驗收標準
- [x] 新增 `scripts/backfill_signals_range.py`：對指定日期範圍計算 composite scores
- [x] 新增 `scripts/backfill_daily_prices_twse.py`：從 TWSE `www.twse.com.tw` 拉全市場 per-stock 歷史股價
- [x] IC 分析 combo（≥6 valid pairs）從 5 個增至 22 個
- [x] Q5 涵蓋天數從 1 天增至 4 天（6/5, 6/8, 6/9, 6/10）
- [x] daily_prices 覆蓋從 140 檔/天增至 344 檔/天
- [x] 原始 `tests/regenerate_signals.py` 保留不變

## 根因分析
1. `signals` 表僅有 6 天資料（專案 6/5 啟動），週末 signals 對應不到 daily_prices → LEAD 找不到 forward return
2. hash-bucket ingestion 每天僅處理 ~120 檔 → daily_prices 不完整 → forward return 配對數不足
3. `min_samples < 6` 過濾門檻阻擋了僅有的幾筆資料

## 更動檔案
- `scripts/backfill_signals_range.py`（新檔）
- `scripts/backfill_daily_prices_twse.py`（新檔）

## 備註
- daily_prices 後續需每週定期 backfill（或改善 hash-bucket 設計）
- TWSE per-stock API 有 rate limit（428/403），需控制 concurrency
