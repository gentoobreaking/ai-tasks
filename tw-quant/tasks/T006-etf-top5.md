---
github_issue: N/A
title: Stage0-A/B — Top5 ETF 排名與成分股去重（F1/F2）
type: feat
priority: high
status: done
depends_on:
- T004-pipeline-skeleton
assignee: "pi with opencode/x-preview-f-free"
created: 2026-08-25
updated: 2026-08-25
---

# T006 - ETF 排名取 Top5 與成分股合併去重

## 目標
依 algs/stage0-universe.md Step A/B 實作股票池建構前半段。

## 驗收標準
- [x] 三年報酬 = 未還原 Close 首尾比（`close[-1]/close[0]−1`）；
      測試斷言程式碼中不存在 Auto-adjust / Adj Close / TaiwanStockPriceAdj
- [x] 排序降序取 Top5，樣本不足三年以實際區間計算並在輸出標註
- [x] 成分股經 fetch_top10_holdings 合併去重：ticker 正規化為 4 位數字、
      剔除 ETF 自身與非普通股
- [x] 記錄 etf_sources（`|` 分隔）與 count；排序 count 降序 → Top1ETF 權重順序
- [x] 去重後 <50 檔時自動延伸持股至 15/20 名迭代補足；無法補足時 log warning 續行
- [x] 單元測試：以 mock holdings 驗證去重、count 計算、延伸補足三情境
      （例：兩 ETF 各含 2330 → count=2、etf_sources="0050.TW|00878.TW"）

## 備註
yfinance 下載重用 yf_utils.batch（每批 ≤50）。API 失敗的 ETF 跳過並警告，不足 5 檔時中止。
