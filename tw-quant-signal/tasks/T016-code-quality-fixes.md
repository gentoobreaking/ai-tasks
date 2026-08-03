---
github_issue: ""
title: "[Phase 3] 程式碼品質改善 — feature stale/latency/redundant API"
type: bugfix
priority: high
status: done
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-02
updated: 2026-08-03
---

# T016 — 程式碼品質改善

## 目標
修正 Review 中發現的數個程式碼品質問題，確保系統穩定性與效能。

對應項目來源：Review 建議分析 (2026-08-02)

## 驗收標準

### 1. Feature 過期修復
- [x] `rules.py:_load_features()` 改用 `GROUP BY stock_id` + `MAX(trade_date)` 查詢（而非一次排序取第一筆）
- [x] _load_features() 新增 trade_date 參數：只回傳 <= 指定日的每檔最新 feature（GROUP BY stock_id + MAX(trade_date) 子查詢 JOIN）
- [x] 當前 pipeline 中 `compute_rule_signals()` 參數 `trade_date` 正確傳入 `_load_features()`

### 2. Valuation 重複呼叫消除
- [x] 將 `features.py:_stock_features()` 中每個股票的 `fetch_valuations()` 抽至 `ingestion.py`
- [x] `ingestion.py` 的 `_ingest_valuations()` 一次拉取全體觀察股票的 valuations（fetch_valuations_all 一次拉 1081 檔），並以 `_latest_valuations` 暫存屬性供 features 階段取用
- [x] `_stock_features()` 接收 `val` 參數，從外部傳入

### 3. 月營收批次 HTTP 平行化
- [x] 使用 `httpx.AsyncClient` 將 `twse_client.py:fetch_monthly_revenue_batch()` 的 sequential 請求轉為批量併發
- [x] 控制並行度在 3–5 個 HTTP 同時連線（_MOPS_CONCURRENCY=3，不衝擊 MOPS）
- [x] 目標：降低月營收獲取時間 > 60%（實測 36 個月 28.0s → 7.3s，降幅 74%）

### 4. 每日計算計算 incremental (optional)
- [x] `indicators.py` 每日只計算最近 60–120 天（features.py 新增 compute_indicators_for_stock，lookback=120；backfill 用 full=True 365 天）
- [x] Pipeline 執行耗時降低（預計至少 40% 節省；管線 ~45s+ → ~17s）

### 5. 錯誤處理與重試
- [x] `twse_client.py` 各 fetch 函式加入 HTTP 重試邏輯（_retry/_retry_async，max 3 retry、指數 backoff base 0.8s max 5s；fetch_daily_prices_all/fetch_market_index/fetch_institutional_flows/fetch_valuations/fetch_historical_daily_prices 全部接入）
- [x] 計入管線的 fail/skip status 的邏輯一致性（monthly_revenue 空結果=最新月份尚未公告，屬正常 skip 不再誤報 fail）

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
- 改進來量測目標：每日管線總耗時間從 ~45s 降至 ~20s（實測 ~17s，達標）

## 驗收紀錄（2026-08-03）
- **Commit**: `da78c7e fix(T016): 程式碼品質改善 — feature stale / latency / redundant API`（branch: main）
- **影響檔案**: rules.py / twse_client.py / features.py / ingestion.py / backtest.py（5 檔，+367/-164）
- **驗收測試**:
  - §1 `_load_features(trade_date)` as_of 過濾正確（2026-07-20 只回傳 2308/2330）；`compute_rule_signals(2026-08-03)` 3 筆訊號
  - §1 回測 as_of 特徵 105 天/30 規則/3d forward，30 rule rows 無錯誤
  - §3 平行化實測：36 個月 28.0s → 7.3s（74% 降幅 > 60% 目標）；增量模式日常近乎零 HTTP
  - §2 fetch_valuations_all 一次拉 1081 檔 0.52s
  - 管線 10 階段全 ok（index/stocks/institutional/indicators/features/monthly_revenue/quarterly_financials/dividends/margin_trading/valuations），總耗時 ~17s
- **已知坑**: MOPS 有時間性 IP 封鎖（30s 內過多請求觸發 FOR SECURITY REASONS，約 90s 清除）；已採單股票內部平行（不跨股票）、並行度 3、增量模式緩解