---
github_issue: ""
title: "[Phase 3] 績效追蹤儀表板補完 — 訊號後 1/3/5 日表現"
type: feature
priority: medium
status: done
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-02
updated: 2026-08-16
---

# T019 — 績效追蹤儀表板補完

## 目標
完成 T009 中已存在但尚未實作的績效追蹤功能：記錄每個信號出現後的 1/3/5 天內市場變現，輸出勝率、交易、虧損、連續虧損等統計。

來源：T009-評標術三項目 — 「訊號後 1/3/5 日表現 + 勝率盈虧比 + 連續虧損次數」
對應規格：`§3.2.2 績效追蹤`

## 驗收標準

### 後端 — 產業績效資料
- [x] `performance_log` 表 (每條規則觸發時記錄)：
```sql
CREATE TABLE performance_log (
    id Integer PRIMARY KEY AUTOINCREMENT,
    stock_id TEXT NOT NULL,
    rule_id TEXT NOT NULL,
    trigger_date TEXT NOT NULL,
    market_state TEXT,
    close_at_trigger REAL,
    after_1d_return REAL,  -- price after 1 day (net of cost)
    after_3d_return REAL,
    after_5d_return REAL,
    after_10d_return REAL,
    inspection_date TEXT,
    UNIQUE(stock_id, rule_id, trigger_date)
)
```

### 後端 — 計算流程
- [x] `src/tw_quant_signal/performance_tracker.py` 計算服務:
  - `compute_performance_log(db, trade_date)` — 查看 `rule_signals` 表本日期, 計算未計算的 performance 指標
  - `compute_agg_stats(db, from_date, to_date)` — 按照市場狀態產生統計報告
- [x] 在日常管線中追加性能記錄步驟 (`pipeline.py`)

### API 端點
- [x] `GET /api/performance/rules?days=30` — 返回每規則的互動表中的 `markdown_table` (勝率/平均報酬/盈虧比/最大DD/-連續虧損)
- [x] `GET /api/performance/overview?days=30` — 整體系統績效概：
  ```
  { total_triggers: X, win_rate: Y%, avg_return: Z, max_dd: A, consecutive_losses: B, by_state: [bull: {...}, bear: {...}, range: {...}] }
  ```
- [x] `GET /api/performance/logs?days=30&rule_id=&stock_id=&market_state=` — 明細查詢供前端表格使用

### 前端
- [x] 在現有儀表板上增加「績效追蹤」頁籤
- [x] 表格顯示: 規則 ID	rule_name	 | 出現時間 | 1d return | 3d return | 5d return
- [x] 依市場狀態片片分類顯示（多頭/空頭/盤整）
- [x] 日期範圍過濾
- [x] 持有期 (1/3/5/10) 可切換
- [x] 展示規則類型 (bullish/bearish/neutral)
- [x] 顯示最長連續虧損、盈虧比、最大 DD、期望值

## 備註
- 此功能的前提是 T016 的 feature stale 揭露問題已修復
- 計入交易成本(使用 backtest.py CostModel)準確反映實際可得報酬
- 不要回補歷史資料績效（只統計將來接入管線後權）
- 績效資料應依規則類型和市場狀態分類，以避免生態偏差

## 任務完成摘要 (2026-08-16)

### 後端實作
- `db.py` — 新增 `performance_log` 表 (含 3 個索引) 及 CRUD 方法:
  - `get_performance_logs()` 支援 rule_id / stock_id / market_state / 日期區間過濾
  - `upsert_performance_logs()` UPSERT 語意
  - `get_performance_logs_distinct_triggers()` 用於增量排除
- `performance_tracker.py` (12.8 KB) — 主要計算邏輯:
  - `compute_performance_log()` — 增量計算 1/3/5/10 日淨報酬 (購 = D+1 收、賣 = D+1+N 收)
  - 使用 `backtest.CostModel.net_return()` 計算淨報酬（扣除手續費、證交稅）
  - `compute_agg_stats()` — 胜率/均酬/盈虧比/最大 DD/連續虧損/期望值 + by_state 分組
  - 自動依規則 type 與市況分組 + Markdown 報表產生器
- `pipeline.py` — 在 `compute_rule_signals` 之後新增兩段:
  - `compute_performance_log()` — 為今日觸發補上 1/3/5/10 日資料（增量）
  - `compute_agg_stats()` — 30 日 KPI 摘要連報主控輸出
- `api/app.py` — 三個新 endpoint:
  - `/api/performance/rules?days=&horizon=&market_state=`
  - `/api/performance/overview?days=&horizon=`
  - `/api/performance/logs?days=&rule_id=&stock_id=&market_state=`

### 前端實作
- `types.ts` — 新增 `PerformanceAgg`, `PerformanceRuleEntry`, `PerformanceOverview`, `PerformanceLog` 型別
- `api/client.ts` — 新增 `performanceOverview()` / `performanceRules()` / `performanceLogs()` 三個 client 方法
- `components/Sidebar.tsx` — 新增「訊號績效追蹤」導覽項目
- `pages/PerformanceTracking.tsx` (10.1 KB) — 完整頁面:
  - 區間 / 持有期 / 市場狀態三組 filter
  - 整體 KPI card（9 項指標）
  - 依市場狀態分類表格
  - 規則明細表格（含類型 / 胜率 / 均酬 / 盈虧比 / 最大 DD / 連虧 / 期望值）
  - 觸發紀錄表格（僅 100 筆 · 可條瀏覽）
  - Markdown 報告呈現

### 測試
- `tests/test_performance_tracker_t019.py` — 15 個單元測試全部通過，涵蓋:
  - DB schema & UNIQUE constraint
  - CRUD 與所有 filter 組合
  - 增量 vs 重寫語意
  - 「無未來價格」處理
  - `_aggregate()` 基礎統計與連續虧損計算
  - `compute_agg_stats()` KPI / by_state / Markdown / horizon fallback
- 完整測試套件: `227 passed, 1 warning`（包含 T019 的 15 個新測試）

### 使用紀錄
- 在真實 `data/signal.db` 上首次執行 `compute_performance_log('2026-08-16')` 成功產生 34 筆 performance_log 記錄
- API 實測 `/api/performance/overview?days=180`、`/api/performance/rules?days=180`、`/api/performance/logs?days=180` 均回傳 200
- Frontend `npx tsc --noEmit` 零錯誤、`npx vite build` 成功
