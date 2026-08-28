---
github_issue: https://github.com/gentoobreaking/ai-tasks/issues/257
title: 完成 T008 剩餘整合測試案例
github_issue: https://github.com/gentoobreaking/ai-tasks/issues/257
/title: 完成 T008 剩餘整合測試案例
/status: done
assignee: 寶寶
---

## 目標

T008 (整合測試) 目前僅標記 done，但**驗證標準全未勾**（0/10）。需對 22 個未完成驗證標準中的 7 個測試案例進行驗證：

| 測試 | 對應任務 | 內容 |
|------|---------|------|
| 測試 3 | T001 | gold_local alert 顯示「📊台銀黃金存摺」 |
| 測試 4 | T004 | 交叉驗證失敗 → 警告不 alert |
| 測試 5 | T002 | gold_local 基準取得失敗 alert |
| 測試 7 | T003 | gold_intl alert 顯示「🌐國際黃金現貨」 |
| 測試 8 | T003 | gold_intl 基準取得失敗 alert |
| 測試 9 | T006 | Yahoo Finance → Alpha Vantage fallback |
| 測試 10 | T007 | 快取 7 天清理驗證 |

## 驗證標準

- [x] 測試 3：暫時調低 gold_local 閾值為 1，驗證 alert 包含「📊台銀黃金存摺」標籤（pass: change=3 >= 1, alert 含 📊台銀黃金存摺，閾值恢復為 30）
- [x] 測試 4：暫時設定 cross_validate 閾值為 1 元，驗證發警告不發 alert，警告含雙方價格與差值（pass: diff=10 > 5, 發資料異常警告含台銀 sell=4703、玉山 sell=4713、差值 10 元）
- [x] 測試 5：刪除快取 + 模擬 day page 只有 1 row + 前一營業日失敗，驗證 alert 含快取狀態、rows 數、前一營業日結果（pass: alert 含「快取狀態：不存在」「day page rows：1 筆」「前一營業日：抓取失敗」）
- [x] 測試 7：暫時調低 gold_intl 閾值為 0.01，驗證 alert 含「🌐國際黃金現貨」標籤（pass: change=$0.50 >= 0.01, alert 含 🌐國際黃金現貨，閾值恢復為 25）
- [x] 測試 8：刪除快取 + 模擬 Yahoo Finance 失敗，驗證 alert 含快取狀態、前一小時結果、金屬名稱（pass: alert 含「快取不存在」「Yahoo Finance 前一小時收盤價抓取失敗」「金屬：黃金」）
- [x] 測試 9：模擬 Yahoo Finance 失敗，驗證 Alpha Vantage fallback 成功，source 顯示 "alpha_vantage"（pass: source=alpha_vantage, price=$4630.0）
- [x] 測試 10：建立 8 天前的快期檔案，執行 --check，確認舊快取被刪除（pass: 8 天前快取檔案已刪除）

## 備註

測試 3/4/5/7/8/9/10 需要暫時修改程式或快取來模擬失敗情境。
