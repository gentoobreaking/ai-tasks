---
github_issue:
title: 個股 CMoney 四法合理價計算器
type: feat
priority: medium
status: done
depends_on: []
assignee: pi with opencode/x-preview-f-free
created: 2026-08-24
updated: 2026-08-24
---

# T44 - 個股 CMoney 四法合理價計算器

## 目標
參考 CMoney 筆記（4種算股方法）實作獨立快速試算工具：輸入台股代號即算出四種方法各自的
便宜／合理／昂貴三價位，存入 Postgres `article_valuations` 表（與主管線 `valuations` 表明確區分）。

## 驗收標準
- [x] 四法齊備：平均股利法（×15/20/30）、歷年股價法、本益比法、股價淨值比法，各產出三價位
- [x] 資料源免 key：FinMind TaiwanStockPrice/TaiwanStockPER 為主（單檔 2~3 請求、約 3 秒），證交所 BWIBBU/MIS 備援
- [x] 防呆：低獲利年度（年中位數EPS<1）PE 自動排除並標註；長期虧損/無殖利率標註略過原因
- [x] 30 天新鮮度防呆：DB 已有未滿一個月資料不重算（--force 強制重算）
- [x] migration 007 建立 `article_valuations`，主鍵 (symbol, as_of, method) upsert 不重複
- [x] fair_value_batch.py 批次跑 0050 名單（fair_value.txt，51 檔）；單檔失敗不中斷、下次自動補算
- [x] 實測 2412/2002/9925（含上櫃）數字合理；ruff check 通過

## 備註
- commit e3b7b4d
- 已知限制：證交所 BWIBBU 僅保留約近 45 個月（FinMind 為主來源後影響有限）；
  股利/EPS 為殖利率與本益比反推的估計值；代理傳輸不穩已加自動重試
