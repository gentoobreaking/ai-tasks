---
github_issue: ""
title: "[Phase 3] 程式碼品質改善 — feature stale/latency/redundant API"
type: bugfix
priority: high
status: pending
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-02
updated: 2026-08-02
---

# T016 — 程式碼品質改善

## 目標
修正 Review 中發現的數個程式碼品質問題，確保系統穩定性與效能。

對應項目來源：Review 建議分析 (2026-08-02)

## 驗收標準

### 1. Feature 過期修復
- [ ] `rules.py:_load_features()` 改用 `GROUP BY stock_id` + `MAX(trade_date)` 查詢（而非一次排序取第一筆）
- [ ] _load_features() 新增 trade_date 參數：只回傳最 N 天內的 feature
- [ ] 當前 pipeline 中 `compute_rule_signals()` 參數 `trade_date` 正確傳入 `_load_features()`

### 2. Valuation 重複呼叫消除
- [ ] 將 `features.py:_stock_features()` 中每個股票的 `fetch_valuations()` 抽至 `ingestion.py`
- [ ] `ingestion.py` 的 `_ingest_valuations()` 一次拉取全體觀察股票的 valuations，並存入獨立表或暫存屬性
- [ ] `_stock_features()` 接收 `val` 參數，從外部傳入

### 3. 月營收批次 HTTP 平行化
- [ ] 使用 `httpx.AsyncClient` 將 `twse_client.py:fetch_monthly_revenue_batch()` 的 sequential 請求轉為批量併發
- [ ] 控制並行度在 3–5 個 HTTP 同時連線（不衝擊 MOPS）
- [ ] 目標：降低月營收獲取時間 > 60%

### 4. 每日計算計算 incremental (optional)
- [ ] `indicators.py` 每日只計算最近 60–120 天（如需預測過去使用 backfill 計算寬計算域）
- [ ] Pipeline 執行耗時降低（預計至少 40% 節省）

### 5. 錯誤處理與重試
- [ ] `twse_client.py` 各 fetch 函式加入 HTTP 重試邏輯（max 3 retry, backoff delay）
- [ ] 計入管線的 fail/skip status 的邏輯一致性（目前部分 skip 不合理）

## 影響的檔案

| 檔案 | 變更類型 | 說明 |
|------|---------|------|
| `src/tw_quant_signal/rules.py` | 修復 | _load_features trade_date 過濾 |
| `src/tw_quant_signal/twse_client.py` | 修改 | fetch_monthly_revenue_batch async 化 + retry log -->
| `src/tw_quant_signal/features.py` | 重構 | 接收外部 valuation 參數 |
| `src/tw_quant_signal/ingestion.py` | 新增 | 增加 _ingest_valuations( ) + 平行層 evaluator |
| `src/tw_quant_signal/indicators.py` | 優化 | 減少重計計算範圍 |
| `src/tw_quant_signal/backtest.py` | 修正 | back test 中的 on-the-fly 特徵微分拆解需更新 |

## 詳細描述

### Feature 過期問題

目前的版本：
```python
# rules.py:217-222 — 風險：today沒有feature就會用昨天的
rows = conn.execute("SELECT stock_id, data FROM features ORDER BY trade_date DESC").fetchall()
```

修正後：
```python
# 加入 trade_date 去重 + 時間範圍限制
rows = conn.execute(
    "SELECT f.stock_id, f.data FROM features f "
    "INNER JOIN (SELECT stock_id, MAX(trade_date) AS mt FROM features "
    "WHERE trade_date <= ? GROUP BY stock_id) latest "
    "ON f.stock_id=latest.stock_id AND f.trade_date=latest.mt",
    [trade_date])
```

## 備註
- 此為**穩定性改善**項，不是新功能 — 主要解決目前 isolate 中已知問題
- 改進來量測目標：每日管線總耗時間從 ~45s 降至 ~20s