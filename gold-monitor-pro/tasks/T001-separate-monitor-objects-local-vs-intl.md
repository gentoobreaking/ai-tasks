---
github_issue: https://github.com/gentoobreaking/ai-tasks/issues/247
title: 分離監控物件（存摺 vs 國際分開）
status: done
assignee: 寶寶
created: 2026-05-01
updated: 2026-05-01
---

## 目標

將 `MetalPrice` dataclass 重構為獨立的監控物件，區分「台銀黃金存摺」與「國際現貨」，並拆分為兩支獨立程式。

## 已完成

- `LocalGoldPrice` dataclass（gold_local_monitor.py）
- `InternationalPrice` dataclass（gold_intl_monitor.py）
- 兩支獨立程式，不互相依賴
- ConfigManager 各自獨立，向後相容舊 config
- 玉山銀行邏輯內嵌在 gold_local_monitor.py

## 驗證標準

- [x] `LocalGoldPrice` 有 buy/sell/time/date/source/timestamp
- [x] `InternationalPrice` 有 metal/price/fx_rate/source/timestamp
- [x] 兩支程式可獨立 `--check` 執行
- [x] 舊 config.json 自動轉換（gold → gold_local + gold_intl）
- [x] alert 訊息顯示「📊台銀黃金存摺」（Test 3 驗證：alert 含 📊台銀黃金存摺 價格變動）
- [x] alert 訊息顯示「🌐國際黃金現貨」（Test 7 驗證：alert 含 🌐國際黃金現貨 價格變動）
- [x] 不同來源的價格不互相影響（Test 3 gold_local alert 僅含台銀價格；Test 7 gold_intl alert 僅含國際價格，互不干擾）