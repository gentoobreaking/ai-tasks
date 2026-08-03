---
github_issue: ""
title: "[Phase 3] 11大指標多空訊號系統"
type: feature
priority: high
status: done
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-02
updated: 2026-08-03
---

# T015 - 11 大指標多空訊號系統

## 目標
建立基於「條件符合計數」的個股多空訊號預覽系統。計算每個標的之 11 大多方指標與 11 大空方指標的符合數，產出 `x/11` 格式的計分卡。透過 Web 頁面以顏色分明的文字顯示是否符合（多方紅色、空方綠色、不符合灰色）。

對應規格：`signal.md` / `tw-stock-ai-signal-spec-v1.2.md §3.4`

## 驗收標準

### 後端 — 指標計算
- [x] `src/tw_quant_signal/signal_scorecard.py` 新模組：`compute_scorecard(db, stock_id, trade_date)` → dict
- [x] 多方 11 項指標的 boolean 計算（全部實現）：

| 指標 | 計算邏輯 | 資料來源 |
|------|---------|---------|
| 創 240 日新高 | `close >= max(past 240 days)` | `daily_prices` 表 |
| 三大法人連續 3 日買超 | `foreign > 0 AND sity > 0 AND dealer > 0` 過去3日 | `institutional_flows` 表 |
| 外資買超 > 500 張 | `foreign_investors_net` 當日值 > 500 張 | `institutional_flows` 表 |
| 外資連買 3 日 | `foreign_investors_net > 0` 過去連續3日 | `institutional_flows` 表 |
| 投信買超 > 500 張 | `sity_investors_net` 當日值 > 500 張 | `institutional_flows` 表 |
| 投信連買 3 日 | `sity_investors_net > 0` 過去連續3日 | `institutional_flows` 表 |
| 主力連買 3 日 | `dealer_net > 0` 過去連續3日（自營商代主主力） | `institutional_flows` 表 |
| 連 3 日收紅 K 棒 | `close > open` 過去連續3日 | `daily_prices` 表 |
| 站上月線 | `close > ma20` | `tech_indicators` 表 |
| 月營收成長 > 10% | `yoy_change > 10` (MoM to same month last year) | `monthly_revenue` 表 |
| 月營收連續成長 | `mom_change > 0` 於最近兩筆月營收 | `monthly_revenue` 表 |

- [x] 空方 11 項指標的 boolean 計算（對應對標）全部實現
- [x] 每日管線自動計算並儲存計分卡（加入 `pipeline.py`）
- [x] `GET /api/signals/{stock_id}/scorecard` — JSON API
- [x] `GET /api/signals/all/scorecard` — 全標的一次輸出

### 前端 — 網頁顯示
- [x] 雙欄佈局：左右邊兩方並排表格
- [x] 多方表格 — 標題 `多方指標: x/11` + 每個指標行顯示紅/灰色文字
- [x] 空方表格 — 標題 `空方指標: x/11` + 每個指標行顯示綠/灰色文字
- [x] 每個指標行含類別說明（價量面／籌碼面／技術面／財務面）
- [x] 整合至既有的儀表板（新頁面或新的 Section）
- [x] CSS 樣式：符合 = 明顯 ± `font-weight: bold` 彩色，不符合 = `color: gray`

### 資料庫
- [x] `scorecard` 表：
```sql
CREATE TABLE scorecard (
    trade_date TEXT NOT NULL,
    stock_id   TEXT NOT NULL,
    bullish_score INTEGER NOT NULL,     -- 0–11
    bearish_score INTEGER NOT NULL,      -- 0–11
    bullish_detail TEXT NOT NULL,        -- JSON field with 11 boolean fields
    bearish_detail TEXT NOT NULL,        -- JSON field with 11 boolean fields
    PRIMARY KEY (trade_date, stock_id)
)
```

### 管線整合
- [x] 每天在 `miner.py` 中加入 scorecard 計算步驟
- [x] scorecard 結果納入 daily report（Markdown + Telegram）

## 已交付檔案（計劃）

```
src/tw_quant_signal/signal_scorecard.py    ← 核心計算模組
src/tw_quant_signal/db.py                  ← + signal_bonniaub 表 + 讀寫方法
src/tw_quant_signal/pipeline.py            ← + scorecard 管線步驟
src/tw_quant_signal/api/app.py             ← + GET /api/signals/*/scorecard
frontend/src/components/Scorecard.tsx      ← React 元件呈現 11 指表格
frontend/src/pages/ScorecardPage.tsx       ← 獨立頁面或作為標籤
```

## 備註
- 此系「原理不依賴權重」的設計，是**純標記式符合/不符合**，不使用被規則
- 不用觸發「信號」但是「情況預覽」，幫助使用者快速掃描多項條件
- 「主力」指自營商中的自行買賣（`dealer_net`）
- 「月營收連成長」使用 `  monthly_revenue` 的 `mom_change > 0` 連續兩筆
---

## 驗收紀錄 (2026-08-03)

**驗收結果：✅ 全部通過**

### 後端 — 指標計算
- `src/tw_quant_signal/signal_scorecard.py` 新模組已建立：`compute_scorecard(db, stock_id, trade_date)` → dict（bullish/bearish 各 11 boolean + count + ratio）
- 多方 11 項指標全部實作（價量面/籌碼面/技術面/財務面四類）
- 空方 11 項指標全部實作（與多方對稱）
- 每日管線自動計算並儲存計分卡（pipeline.py 新增 scorecard 步驟，status 追蹤）
- `GET /api/signals/{stock_id}/scorecard` — 單一標的 JSON API（含 DB 讀取 + on-the-fly fallback）
- `GET /api/signals/all/scorecard` — 全標的一次輸出（注意：此路由須宣告於 `{stock_id}` 之前避免匹配衝突）

### 前端 — 網頁顯示
- `Scorecard.tsx`：雙欄佈局（多方表格左、空方表格右）
- 多方表格標題 `多方指標: x/11`，符合=紅色 bold，不符合=灰色
- 空方表格標題 `空方指標: x/11`，符合=綠色 bold，不符合=灰色
- 每行含類別標籤（價量面/籌碼面/技術面/財務面）分類列
- 整合至 StockObservation 頁面（多時間框架共識下方）
- CSS 樣式：`.match-red`/`.match-green`（bold 彩色）、`.no-match`（gray）

### 資料庫
- `scorecard` 表已建立（trade_date + stock_id PK、bullish_score/bearish_score/bullish_detail/bearish_detail JSON）

### 管線整合
- pipeline.py 每日計算（WATCH_STOCKS 3 檔）
- scorecard 結果納入每日 Markdown 報告（reporter.py 新增計分卡摘要表）

### 實測結果（2026-07-31 資料）
| 標的 | 多方 | 空方 | 方向 |
|------|------|------|------|
| 2330 | 5/11 | 2/11 | 🟢 多方 |
| 0050 | 3/11 | 2/11 | 🟢 多方 |
| 2308 | 2/11 | 5/11 | 🔴 空方 |

- API 測試：`/api/signals/2330/scorecard` 200、`/api/signals/all/scorecard` 200、未知代號 200（回傳 data:null）
- 前端 build 成功（vite v6.4.3，697 modules，僅 chunk>500kB 警告）
- 驗收 commit：`eafe62b`

### 備註
- 「主力」以自營商 `dealer_net` 為代理（與任務書一致）
- 月營收連續成長/負成長使用 `monthly_revenue.mom_change` 連續兩筆（近兩月）
- 創 240 日新高/低以過去 240 日（不含當日）最高/最低價比較
