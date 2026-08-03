---
github_issue: ""
title: "[014-2] EPS/ROE/ROA — 近五年/四季"
type: feature
priority: medium
status: done
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-07-30
updated: 2026-08-03
---

# T014-2 - EPS / ROE / ROA（近五年 + 近四季）

## 目標
補齊個股詳細頁面的季財務資料圖表。EPS 近 20 季（5 年）長條圖、ROE / ROA 近 4 季資料卡。

**資料源**: TWSE 財務報表（季報，可從公開資訊觀測站擷取）

**DB Schema — 擴充 `financial_data` 表**:

現有 `financial_data` 欄位：`fiscal_quarter`, `eps`, `revenue`, `gross_margin`

需新增欄位：
| 欄位 | 型態 | 說明 |
|------|------|------|
| roe | REAL | 股東權益報酬率 (%) |
| roa | REAL | 資產報酬率 (%) |

若避免改既有表結構導致資料丟失，可另建 `quarterly_financials` 表：

| 欄位 | 型態 | 說明 |
|------|------|------|
| stock_id | TEXT | 標的代號 |
| fiscal_quarter | TEXT | 會計季度 (2025Q1) |
| eps | REAL | 每股盈餘 |
| revenue | REAL | 營收 |
| gross_margin | REAL | 毛利率 (%) |
| roe | REAL | ROE (%) |
| roa | REAL | ROA (%) |

- PK: (stock_id, fiscal_quarter)

## 驗收標準
- [ ] `quarterly_financials` 表（含 roe/roa）及 CRUD
- [ ] 季資料擷取模組（yfinance + 本地推算 ROE/ROA）
- [ ] 管線串接：每季排程更新
- [ ] `GET /api/stocks/{id}/quarterly-financials` 端點
- [ ] 前端個股詳細頁面：EPS 長條圖 + ROE/ROA 卡片
- [ ] 前端建置無錯誤

## 備註
- ROE/ROA 可從資產負債表與損益表推算，盡量取得原始數據後自行計算
- 初始需 backfill 近 20 季資料

---
## 驗收紀錄 (2026-08-03)
- 驗收通過：全部端點 200、前端 build 成功、pipeline 執行正常
- 修復事項：見 git commit 4344513「fix: T014 驗收修復 — ROE/股利/類股排名/月營收/健診」
