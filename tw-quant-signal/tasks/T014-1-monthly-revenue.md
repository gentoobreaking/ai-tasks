---
github_issue: ""
title: "[014-1] 月營收 — 近三年圖表"
type: feature
priority: medium
status: done
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-07-30
updated: 2026-07-30
---

# T014-1 - 月營收（近三年）

## 目標
補齊個股詳細頁面的月營收圖表（近 36 個月），含長條圖（月營收）與折線圖（年增率）。

**資料源**: TWSE 月營收公開資訊（每月 10 日前公告前月營收）

**DB Schema — `monthly_revenue`**:

| 欄位 | 型態 | 說明 |
|------|------|------|
| stock_id | TEXT | 標的代號 |
| year_month | TEXT | 年月 (YYYY-MM) |
| revenue | REAL | 當月營收（千元） |
| mom_change | REAL | 月增率 (%) |
| yoy_change | REAL | 年增率 (%) |

- PK: (stock_id, year_month)

## 驗收標準
- [ ] `monthly_revenue` 表建立及 CRUD
- [ ] 月營收資料擷取模組（TWSE 爬取/API）
- [ ] 管線串接：可排程每月抓取
- [ ] `GET /api/stocks/{id}/monthly-revenue` 端點
- [ ] 前端個股詳細頁面：月營收圖表（長條+折線）
- [ ] 前端建置無錯誤

## 備註
- 月營收為每月固定資料，TWSE 通常在次月 10 日前公告
- 初始需一次性 backfill 近 36 個月資料
