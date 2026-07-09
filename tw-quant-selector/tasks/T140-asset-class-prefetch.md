---
github_issue:
title: "台股資產分類與價格預先下載模組"
type: feature
priority: high
status: done
assignee: "OpenCode with DeepSeek V4 Flash"
created: 2026-07-09
updated: 2026-07-09
---

# T140 - 台股資產分類與價格預先下載模組

## 目標
建立資產分類模組 `scripts/asset_class_prefetch.py`，從 PostgreSQL `stocks` 表讀取全市場股票/ETF 清單，完成三類資產分類，並透過 `yfinance` 預先下載 2021-01-01 ~ 至今的含息調整收盤價，輸出為中間 pickle 檔供後續任務使用。

## 背景說明
- DB `daily_prices` 僅有 2025-10 ~ 今的資料，無法滿足 5 年分析需求
- 既有 `cagr.py` 已使用 `yfinance` 作為歷史價格來源
- 需從 `stocks` 表讀取 `stock_id`、`stock_name`、`market`、`is_etf` 欄位

## 驗收標準
- [x] 能正確從 PostgreSQL 讀取 stocks 表並區分三類資產
- [x] 前 54 大權值股（含熱門股 2330/2317/2454/2412/2308/2881/2882/2002）
- [x] ETF 分類符合預期（0050, 006208 → 市場型；0056, 00878 → 配息型）
- [x] yfinance 批次下載成功：台股 54/54，市場型ETF 85/85，配息型ETF 61/61
- [x] 全部 200 資產皆下載成功，無失敗

## 更動檔案
- `scripts/asset_class_prefetch.py`（新檔案）
- `output/asset_comparison_2021_2026/`（新目錄，自動建立）
