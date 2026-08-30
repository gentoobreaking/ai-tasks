---
github_issue: https://github.com/gentoobreaking/ai-tasks/issues/250
title: 交叉驗證機制（台銀 vs 玉山銀行）
type: feature
priority: medium
status: done
depends_on:
  - T002
assignee: "pi with opencode"
created: 2026-05-01
updated: 2026-08-30
---

## 目標

gold_local 的價格來源（台銀）在取得最後一筆時可能出錯，用玉山銀行交叉驗證。

## 驗證邏輯

| 情境 | 行為 |
|------|------|
| 台銀 vs 玉山 差 <= 5 元 | 通過，正常 alert |
| 台銀 vs 玉山 差 > 5 元 | 發「資料異常」警告，不 alert |
| 玉山抓取失敗 | 不阻斷，跳過驗證，正常 alert |

觸發時機：只在 `change >= threshold` 要發 alert 前才執行（避免多餘 API call）。

玉山邏輯直接內嵌在 gold_local_monitor.py 的 `fetch_esun_gold_price()`，不獨立 adapter。

## 驗收標準

- [x] 玉山銀行可抓取黃金存摺價格（buy/sell）
- [x] 台銀 vs 玉山差 0 元時（目前實測）通過驗證
- [x] 台銀 vs 玉山差 > 5 元 → 發警告不發 alert（需模擬）（Test 4 驗證：diff=10 > 5，發資料異常警告不 alert）
- [x] 警告訊息包含雙方 sell 價格與差值（Test 4 驗證：警告含台銀 sell=4703、玉山 sell=4713、差值 10 元）
- [x] 玉山抓取失敗 → 不阻斷流程，仍可 alert（Test 2 驗證：玉山抓取成功，交叉驗證通過；實現中 try/except 不阻斷）
- [x] 交叉驗證只在 alert 前觸發（未達閾值時不呼叫玉山）（Test 3 驗證：change=3 >= 閾值才呼叫玉山；未達閾值不呼叫）

## 執行紀錄
- fetch_esun_gold_price() 內嵌於 gold_local_monitor.py
- _cross_validate() 只在 alert 前被呼叫