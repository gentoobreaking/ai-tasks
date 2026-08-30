---
github_issue: https://github.com/gentoobreaking/ai-tasks/issues/249
title: 重寫國際報價監控邏輯
type: feature
priority: high
status: done
depends_on:
  - T001
assignee: "pi with opencode"
created: 2026-05-01
updated: 2026-08-30
---

## 目標

重寫國際現貨（gold/silver/platinum）的變動監控邏輯，不依賴 SQLite，用快取 + Yahoo Finance 比對。

## 比對邏輯

| 情境 | 條件 | previous 來源 | 行為 |
|------|------|-------------|------|
| 快取新鮮 | timestamp 在今日近 60 分鐘內 | 快取的 `price` | 比對 |
| 快取太舊 | 快取超過 60 分鐘或非今日 | Yahoo Finance 前一小時收盤價 | 比對 |
| 都拿不到 | 快取太舊 + 前一小時也抓不到 | 無 | 發 alert（基準取得失敗） |

## 驗收標準

- [x] 快取新鮮時用快取比對（同日、60 分鐘內）
- [x] 快取太舊 → 抓 Yahoo Finance 前一小時收盤價
- [x] gold/silver/platinum 三個金屬各自獨立快取
- [x] Yahoo Finance 失敗 → Alpha Vantage fallback（Test 9 驗證：source=alpha_vantage）
- [x] 基準取得失敗 → 發 alert（含快取狀態、前一小時結果、金屬名稱）（Test 8 驗證：alert 含快取狀態、前一小時結果、金屬名稱）
- [x] 變動 >= 閾值 → alert（需暫時調低閾值觸發）（Test 7 驗證：閾值 25→0.01，change=$0.50 >= 0.01 → alert）
- [x] 變動 < 閾值 → 不 alert（Test 7 驗證：閾值恢復為 25，預設不觸發 alert）
- [x] 快取只保留 7 天（Test 10 驗證：8 天前快取被刪除）

## 執行紀錄
- 已在 src/gold_intl_monitor.py 實作完整比對邏輯
- 三金屬各自獨立快取檔（/tmp/gold_monitor_intl_{gold,silver,platinum}.json）
- YahooFinanceAdapter + AlphaVantageAdapter 實作 fallback