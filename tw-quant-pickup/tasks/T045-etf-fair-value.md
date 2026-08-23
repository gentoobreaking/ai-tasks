---
github_issue:
title: ETF 兩法合理價計算器
type: feat
priority: medium
status: done
depends_on: [T044]
assignee: pi with opencode/x-preview-f-free
created: 2026-08-24
updated: 2026-08-24
---

# T45 - ETF 兩法合理價計算器

## 目標
為 ETF 提供市場常用的兩種估價法，各產出便宜／合理／昂貴三價位，存入 Postgres `etf_valuations` 表
（與 `article_valuations`、主管線 `valuations` 三套明確區分）。共用 T44 的新鮮度防呆與 FinMind 元件。

## 驗收標準
- [x] historical_price 股價估價法：近 N 年各年最低/(高+低)/2/最高均值 → 便宜/合理/昂貴（上市未滿 3 年略過）
- [x] dividend_yield 殖利率估價法：近 3 年平均配息 ÷ 7%/6%/5%
- [x] 配息資料依除息日去重（FinMind 同一除息日可能有重複列），避免雙重計算
- [x] migration 008 建立 `etf_valuations`；30 天防呆沿用（is_fresh 支援指定 table）
- [x] etf_fair_value_batch.py 預設讀 tools/etf_list.txt（10 檔）；--force/--dry-run/--symbols-file 齊備
- [x] 實測 0050/00878 數字合理並入庫；ruff check 通過

## 備註
- commit 2d0b054
- 共用元件強化：is_fresh 支援指定 table；finmind() 支援 FINMIND_TOKEN；
  connect_db() 對誤用 Docker 內部主機名 postgres 的 DSN 自動改用 localhost 重試
