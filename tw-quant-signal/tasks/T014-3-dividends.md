---
github_issue: ""
title: "[014-3] 股利 — 近五年分派紀錄"
type: feature
priority: medium
status: done
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-07-30
updated: 2026-07-30
---

# T014-3 - 股利分派（近五年）

## 目標
補齊個股詳細頁面的股利分派表格，包含發放年度、除權息日、除權息前收盤價、現金股利、現金發放日、現金殖利率(%)、股票股利。

**資料源**: TWSE 除權息資訊 / 公開資訊觀測站

**DB Schema — `dividends`**:

| 欄位 | 型態 | 說明 |
|------|------|------|
| stock_id | TEXT | 標的代號 |
| year | INTEGER | 發放年度 |
| ex_date | TEXT | 除權息日 (YYYY-MM-DD) |
| close_before_ex | REAL | 除權息前收盤價 |
| cash_dividend | REAL | 現金股利 (元) |
| cash_pay_date | TEXT | 現金發放日 (YYYY-MM-DD) |
| cash_yield | REAL | 現金殖利率 (%) |
| stock_dividend | REAL | 股票股利 (元) |

- PK: (stock_id, year)

## 驗收標準
- [ ] `dividends` 表建立及 CRUD
- [ ] 股利資料擷取模組（yfinance / TWSE）
- [ ] 管線串接：每年更新
- [ ] `GET /api/stocks/{id}/dividends` 端點
- [ ] 前端個股詳細頁面：股利表格
- [ ] 前端建置無錯誤

## 備註
- 股利資訊與除權息日屬歷史資料，初始需一次性大量 backfill
