---
github_issue: ""
title: "[Phase 3] 績效追蹤儀表板補完 — 訊號後 1/3/5 日表現"
type: feature
priority: medium
status: pending
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-02
updated: 2026-08-02
---

# T019 — 績效追蹤儀表板補完

## 目標
完成 T009 中已存在但尚未實作的績效追蹤功能：記錄每個信號出現後的 1/3/5 天內市場變現，輸出勝率、交易、虧損、連續虧損等統計。

來源：T009-評標術三項目 — 「訊號後 1/3/5 日表現 + 勝率盈虧比 + 連續虧損次數」
對應規格：`§3.2.2 績效追蹤`

## 驗收標準

### 後端 — 產業績效資料
- [ ] `performance_log` 表 (每條規則觸發時記錄)：
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
    PRIMARY KEY (stock_id, rule_id, trigger_date)
)
```

### 後端 — 計算流程
- [ ] `src/tw_quant_signal/performance_tracker.py` 計算服務:
  - `compute_performance_log(db, trade_date)` — 查看 `rule_signals` 表本日期, 計算未計算的 performance 指標
  - `compute_agg_stats(db, from_date, to_date)` — 按照市場狀態產生統計報告
- [ ] 在日常管線中追加性能記錄步驟 (`pipeline.py`)

### API 端點
- [ ] `GET /api/performance/rules?days=30` — 返回每規則的互動表中的 `markdown_table` (勝率/平均報酬/盈虧比/最大DD/-連續虧損)
- [ ] `GET /api/performance/overview?days=30` — 整體系統績效概：
  ```
  { total_triggers: X, win_rate: Y%, avg_return: Z, max_dd: A, consecutive_losses: B, by_state: [bull: {...}, bear: {...}, range: {...}] }
  ```

### 前端
- [ ] 在現有儀表板上增加「績效追蹤」頁籤
- [ ] 表格顯示: 規則 ID	rule_name	 | 出現時間 | 1d return | 3d return | 5d return
- [ ] 依市場狀態片片分類顯示（多頭/空頭/盤整）
- [ ] 日期範圍過濾

## 備註
- 此功能的前提是 T016 的 feature stale 揭露問題已修復
- 計入交易成本(使用 backtest.py CostModel)準確反映實際可得報酬
- 不要回補歷史資料績效（只統計將來接入管線後權）
- 績效資料應依規則類型和市場狀態分類，以避免生態偏差