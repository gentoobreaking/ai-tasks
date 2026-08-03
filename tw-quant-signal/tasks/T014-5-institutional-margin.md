---
github_issue: ""
title: "[014-5] 法人買賣超 & 融資融券"
type: feature
priority: medium
status: done
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-07-30
updated: 2026-08-03
---

# T014-5 - 法人買賣超與融資融券

## 目標
補齊個股詳細頁面的法人買賣超與融資融券表格（每日資料）。

### 法人買賣超
- 日期、外資(張)、投信(張)、自營商(張)、合計(張)

**資料源**: TWSE 三大法人買賣超日報（既有 `institutional_flows` 表已有資料）

**實作**: 擴充既有 `institutional_flows` 表查詢即可（該表已有 `total_net` 欄位），無需新表，僅需 API 端點 + 前端表格。

### 融資融券
- 日期、融資張數(餘額)、融券張數(餘額)

**資料源**: TWSE 融資融券日報

**DB Schema — `margin_trading`**:

| 欄位 | 型態 | 說明 |
|------|------|------|
| stock_id | TEXT | 標的代號 |
| trade_date | TEXT | 日期 (YYYY-MM-DD) |
| margin_buy | INTEGER | 融資買進張數 |
| margin_sell | INTEGER | 融資賣出張數 |
| margin_balance | INTEGER | 融資餘額(張數) |
| short_sell | INTEGER | 融券賣出張數 |
| short_buy | INTEGER | 融券買進張數 |
| short_balance | INTEGER | 融券餘額(張數) |

- PK: (stock_id, trade_date)

## 驗收標準

### 法人買賣超
- [x] 利用既有 `institutional_flows` 表（已有 foreign/sity/dealer/total）
- [x] `GET /api/stocks/{id}/institutional-trades` 端點
- [x] 前端個股詳細頁面：法人買賣超表格（含合計）
- [x] 前端建置無錯誤

### 融資融券
- [x] `margin_trading` 表建立及 CRUD
- [x] 融資融券資料擷取模組（TWSE TWT93U 已有 `fetch_margin_data()`，需擴充）
- [x] 管線串接：日排程更新
- [x] `GET /api/stocks/{id}/margin-trading` 端點
- [x] 前端個股詳細頁面：融資融券表格
- [x] 前端建置無錯誤

## 備註
- 法人買賣超日報每日下午約 16:00 更新
- 融資融券約 20:00 更新
- 既有 `institutional_flows` 表已含 `foreign_investors_net` / `sity_investors_net` / `dealer_net` / `total_net`，直接查詢即可
- 既有 `fetch_margin_data()` 只抓餘額，需擴充到買賣張數

---
## 驗收紀錄 (2026-08-03)
- 驗收通過：全部端點 200、前端 build 成功、pipeline 執行正常
- 修復事項：見 git commit 4344513「fix: T014 驗收修復 — ROE/股利/類股排名/月營收/健診」
