---
github_issue: N/A
title: Stage0-C — MoneyDJ 族群標記輸出 data/universe.csv（F3）
type: feat
priority: medium
status: done
depends_on:
- T006-etf-top5
assignee: "pi with opencode/x-preview-f-free"
created: 2026-08-25
updated: 2026-08-25
---

# T007 - MoneyDJ 族群標記與 universe.csv 產生

## 目標
依 algs/stage0-universe.md Step C，為股票池標記 MoneyDJ 產業別並產出 universe.csv。

## 驗收標準
- [x] GET ZHA 頁以 `decode('big5', errors='ignore')` 解析；
      解析出 ≥1000 個 `a=C######` 產業連結
- [x] 產業頁解析 `Link2Stk('AS####')` 建立 stock_no→industry 映射；
      每頁間隔走 rate limiter `"moneydj"` 通道（≥2s）
- [x] 快取 30 天（cache key `pipeline_moneydj_map`）；未到期直接讀快取
- [x] 找不到分類者 sector=UNKNOWN；輸出統計 log「N 檔已分類 / M 檔 UNKNOWN」
- [x] 產出 data/universe.csv 含五欄位（ticker,name,sector,etf_sources,count）UTF-8
- [x] TTL 7 天內且 --rebuild-universe 未指定時，直接載入既有 universe.csv
- [x] 整合測試：以 3~5 檔已知股（如 2330=半導體業? 以實抓為準、2882=金融）斷言 sector 非空

## 備註
MoneyDJ 無反爬（curl 實測可達）；沙箱代理可能擋，本機執行為準。
WantGoo 已評估棄用（SPA 抓不到）。
