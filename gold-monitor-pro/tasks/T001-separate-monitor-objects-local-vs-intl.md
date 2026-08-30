---
github_issue: https://github.com/gentoobreaking/ai-tasks/issues/247
title: 分離監控物件（存摺 vs 國際分開）
type: feature
priority: high
status: done
depends_on: []
assignee: "pi with opencode"
created: 2026-05-01
updated: 2026-08-30
---

## 目標

將 `MetalPrice` dataclass 重構為獨立的監控物件，區分「台銀黃金存摺」與「國際現貨」，並拆分為兩支獨立程式。

## 驗收標準

- [x] `LocalGoldPrice` dataclass 有 buy/sell/time/date/source/timestamp/baseline_buy/baseline_sell 欄位
- [x] `InternationalPrice` dataclass 有 metal/price/fx_rate/source/timestamp/baseline_price 欄位
- [x] 兩支程式（gold_local_monitor.py、gold_intl_monitor.py）可獨立 `--check` 執行
- [x] 舊 config.json 自動轉換（gold → gold_local + gold_intl）
- [x] alert 訊息顯示「📊台銀黃金存摺」（Test 3 驗證：alert 含 📊台銀黃金存摺 價格變動）
- [x] alert 訊息顯示「🌐國際黃金現貨」（Test 7 驗證：alert 含 🌐國際黃金現貨 價格變動）
- [x] 不同來源的價格不互相影響（Test 3 gold_local alert 僅含台銀價格；Test 7 gold_intl alert 僅含國際價格，互不干擾）

## 執行紀錄
- 已在 src/gold_local_monitor.py 實作 LocalGoldPrice
- 已在 src/gold_intl_monitor.py 實作 InternationalPrice
- ConfigManager 實作舊格式自動遷移