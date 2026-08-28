---
github_issue: https://github.com/gentoobreaking/ai-tasks/issues/248
title: 重寫 gold_local 監控邏輯
status: done
assignee: 寶寶
created: 2026-05-01
updated: 2026-05-01
---

## 目標

重寫黃金存摺（gold_local）的變動監控邏輯，不依賴 SQLite，用快取 + day page 比對。

## 比對邏輯

| 情境 | 條件 | previous 來源 | 行為 |
|------|------|-------------|------|
| 快取新鮮 | timestamp 在今日近 10 分鐘內 | 快取的 `now` | 比對 |
| 快取太舊 + >= 2 rows | 快取超過 10 分鐘 | day page 倒數第二筆 | 比對 |
| 快取太舊 + 只有 1 row | 同上 | 前一營業日 day page 最後一筆 | 比對 |
| 都拿不到 | 快取太舊 + rows < 2 + 前一營業日也失敗 | 無 | 發 alert（基準取得失敗） |

## 驗證標準

- [x] 快取新鮮時用快取比對（同日、10 分鐘內）
- [x] 快取太舊 + >= 2 rows → 用 day page 倒數第二筆
- [x] 快取太舊 + 只有 1 row → 抓前一營業日最後一筆（Test 5 驗證：1 row + 前一營業日失敗 → 發 alert）
- [x] 前一營業日抓取：往前找最多 5 天，處理連假（fetch_prev_business_day_close 實現，Test 5 驗證程式碼路徑觸發）
- [x] 基準取得失敗 → 發 alert（含快取狀態、rows 數、前一營業日結果）（Test 5 驗證：alert 含快取狀態、rows 數、前一營業日結果）
- [x] 變動 >= 閾值 → 交叉驗證 → alert（需暫時調低閾值觸發）（Test 3 驗證：閾值 30→1，change=3 >= 1 → alert）
- [x] 變動 < 閾值 → 不 alert（Test 3 驗證：閾值恢復為 30，預設不觸發 alert）
- [x] 快取只保留 7 天（Test 10 驗證：8 天前快取被刪除）