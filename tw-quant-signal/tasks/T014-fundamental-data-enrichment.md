---
github_issue: ""
title: "[Phase 3] 個股基本面資料擴充 — 月營收 / EPS / ROE/ROA / 股利"
type: feature
priority: medium
status: done
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-07-30
updated: 2026-07-30
---

# T014 - 個股基本面資料擴充

## 目標
補齊個股詳細頁面的基本面圖表資料，涵蓋三大塊：

### 1. 月營收（近三年）
**資料源**: TWSE 月營收公開資訊（每月 10 日前公告前月營收）

**需求規格**:
- 顯示近 36 個月（3 年）的月營收
- 欄位：年月、當月營收、月增率(%)、年增率(%)
- 前端需提供長條圖（月營收）搭配折線圖（年增率）

**DB Schema — `monthly_revenue`**:

| 欄位 | 型態 | 說明 |
|------|------|------|
| stock_id | TEXT | 標的代號 |
| year_month | TEXT | 年月 (YYYY-MM) |
| revenue | REAL | 當月營收（千元） |
| mom_change | REAL | 月增率 (%) |
| yoy_change | REAL | 年增率 (%) |

- PK: (stock_id, year_month)

### 2. EPS / ROE / ROA（近五年 + 近四季）
**資料源**: TWSE 財務報表（季報，可從公開資訊觀測站擷取）

**需求規格**:
- EPS 近 20 季（5 年）長條圖
- ROE / ROA 近 4 季
- 前端顯示：每季資料卡（季度、EPS、ROE、ROA）

**DB Schema — 擴充 `financial_data` 表**:

現有 `financial_data` 欄位：`fiscal_quarter`, `eps`, `revenue`, `gross_margin`

需新增欄位：
| 欄位 | 型態 | 說明 |
|------|------|------|
| roe | REAL | 股東權益報酬率 (%) |
| roa | REAL | 資產報酬率 (%) |

若為避免改既有表結構，可另建 `quarterly_financials` 表：

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

### 3. 股利分派（近五年）
**資料源**: TWSE 除權息資訊 / 公開資訊觀測站

**需求規格**:
- 近 5 年股利分派紀錄
- 欄位：發放年度、除權息日、除權息前收盤價、現金股利、現金發放日、現金殖利率(%)、股票股利
- 前端顯示表格

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

### 月營收
- [ ] `monthly_revenue` 表建立及 CRUD
- [ ] 月營收資料擷取模組（TWSE 爬取/API）
- [ ] 管線串接：可排程每月抓取
- [ ] `GET /api/stocks/{id}/monthly-revenue` 端點
- [ ] 前端個股詳細頁面：月營收圖表（長條+折線）
- [ ] 前端建置無錯誤

### EPS / ROE / ROA
- [ ] 季財務資料表（`quarterly_financials` 或擴充 `financial_data`）及 CRUD
- [ ] 季資料擷取模組（公開資訊觀測站）
- [ ] 管線串接：每季排程更新
- [ ] `GET /api/stocks/{id}/quarterly-financials` 端點
- [ ] 前端個股詳細頁面：EPS 長條圖 + ROE/ROA 卡片
- [ ] 前端建置無錯誤

### 股利
- [ ] `dividends` 表建立及 CRUD
- [ ] 股利資料擷取模組
- [ ] 管線串接：每年更新
- [ ] `GET /api/stocks/{id}/dividends` 端點
- [ ] 前端個股詳細頁面：股利表格
- [ ] 前端建置無錯誤

### 4. 類股排名
**需求規格**:
- 找出該個股所屬產業/類股（從 TWSE 產業分類查詢）
- 在該類股中，比較 EPS、ROE、ROA 的百分位排名
- 前端顯示：該股所屬類股 + 各指標於該類股中的位置（前 N%）

**註**: 非獨立資料表，邏輯可寫在 API 層或另建聚合查詢。初始版本可用硬編碼類股對照，未來再補即時查詢。

#### 驗收標準
- [ ] 類股對照表（硬編碼或動態查詢）
- [ ] `GET /api/stocks/{id}/sector-ranking` 端點回傳該股所屬類股及百分位排名
- [ ] 前端顯示：類股標籤 + EPS/ROE/ROA 在該類股中的位置
- [ ] 前端建置無錯誤

### 5. 法人買賣超與融資融券
**資料源**: TWSE 三大法人買賣超日報 / 融資融券日報

**需求規格**:
- 法人買賣超：日期、外資(張)、投信(張)、自營商(張)、合計(張)
- 融資融券：日期、融資張數(餘額)、融券張數(餘額)
- 前端顯示兩個表格 tab（法人買賣超 / 融資融券）

**DB Schema — `institutional_trades`**:
| 欄位 | 型態 | 說明 |
|------|------|------|
| stock_id | TEXT | 標的代號 |
| trade_date | TEXT | 日期 (YYYY-MM-DD) |
| foreign_buy_sell | INTEGER | 外資買賣超張數 |
| sity_buy_sell | INTEGER | 投信買賣超張數 |
| dealer_buy_sell | INTEGER | 自營商買賣超張數 |
| total_buy_sell | INTEGER | 合計買賣超張數 |
- PK: (stock_id, trade_date)

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        > 現有 `institutional_flows` 表已有外資/投信/自營商買賣超（有記錄時才存），可研究是否直接擴充該表加 `total` 欄位即可，或另建新表。

#### 驗收標準
- [ ] `institutional_trades` 表（或擴充 `institutional_flows`）及 CRUD
- [ ] 法人買賣超資料擷取模組
- [ ] 管線串接：日排程更新
- [ ] `GET /api/stocks/{id}/institutional-trades` 端點
- [ ] 前端個股詳細頁面：法人買賣超表格
- [ ] 前端建置無錯誤

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

#### 驗收標準
- [ ] `margin_trading` 表建立及 CRUD
- [ ] 融資融券資料擷取模組
- [ ] 管線串接：日排程更新
- [ ] `GET /api/stocks/{id}/margin-trading` 端點
- [ ] 前端個股詳細頁面：融資融券表格
- [ ] 前端建置無錯誤

## 備註
- 月營收為每月固定資料，TWSE 通常在次月 10 日前公告
- ROE/ROA 可從資產負債表與損益表推算，盡量取得原始數據後自行計算
- 股利資訊與除權息日屬歷史資料，初始需一次性大量 backfill
- 注意 TWSE 開放資料可能有反爬蟲機制，建議使用 twstock 或自建 requests + parser
- 此任務不處理法說會資料，僅聚焦公告財報與營收數字
- 法人買賣超日報每日下午約 16:00 更新；融資融券約 20:00 更新
- 類股排名可用簡化版先上（預先定義數個類股對照），後續再優化為動態查詢
