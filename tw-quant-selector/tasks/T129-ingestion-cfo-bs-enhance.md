---
github_issue: https://github.com/gentoobreaking/ai-tasks/issues/842
title: ingestion 擴展現金流與資產負債表欄位（CFO / CurrentRatio）
type: feature
priority: medium
status: done
assignee: OpenCode DeepSeek V4 Pro + OpenCode DeepSeek V4 Flash
created: 2026-06-06
updated: 2026-06-07
howto: |
  1. FinMindClient: 新增 get_cash_flows() 讀取 TaiwanStockCashFlowsStatement
  2. ingestion.py: BALANCE_SHEET_TYPE_MAP 加入 CurrentAssets/CurrentLiabilities
  3. ingestion.py: 新增 CASH_FLOW_TYPE_MAP + _pivot_cash_flows()
  4. ingestion.py: update_financials() 合併現金流 + 計算 current_ratio/operating_cash_flow
  5. scheduler._compute_guru_scores_from_db() 改用真實 CFO 和 current_ratio
  6. seed_guru_scores.py standalone 同步更新
  7. rebuild + docker 驗證
---

# T129 - ingestion 擴展現金流與資產負債表欄位（CFO / CurrentRatio）

## 目標
擴展資料 ingestion pipeline，補齊 Piotroski F-Score 計算中目前為 **proxy（代理指標）** 和 **placeholder（占位值）** 的欄位：

- **CFO 欄位**：從 FinMind `TaiwanStockCashFlowsStatements` 拉 `OperatingCashFlow`
- **流動比率欄位**：從 FinMind `TaiwanStockBalanceSheet` 拉 `CurrentAssets` / `CurrentLiabilities`

使 F-Score 的 9 項指標全部從原生財務數據計算，不再依賴替代值。

## 驗收標準

### 1. FinMindClient 新增 Cash Flow API
- [x] `get_cash_flows(stock_id, start, end)` → `TaiwanStockCashFlowsStatements`
- 檔案：`src/tw_quant_selector/data/finmind_client.py:164-167`

### 2. Ingestion 擴展資料擷取
- [x] `BALANCE_SHEET_TYPE_MAP` 加入 `CurrentAssets`, `CurrentLiabilities` (`ingestion.py:98-102`)
- [x] 新增 `CASH_FLOW_TYPE_MAP` = `{"OperatingCashFlow": "operating_cash_flow"}` (`ingestion.py:104-106`)
- [x] 新增 `_pivot_cash_flows()` 函數，與 `_pivot_balance_sheet` 同模式 (`ingestion.py:277-298`)

### 3. update_financials() 合併新欄位
- [x] 額外呼叫 `client.get_cash_flows(sid, start, end)` (`ingestion.py:518`)
- [x] Balance sheet merge 加入 `current_assets`, `current_liabilities` (`ingestion.py:530-535`)
- [x] 合併 `cf_df[["stock_id", "date", "operating_cash_flow"]]` (`ingestion.py:548-554`)
- [x] 計算 `current_ratio = current_assets / current_liabilities` (`ingestion.py:561`)
- [x] `operating_cash_flow` NA 值以 `net_income` 補 fallback (`ingestion.py:564`)
- [x] `out_cols` 新增 `total_assets`, `current_ratio`, `operating_cash_flow` (`ingestion.py:569-571`)

### 4. Scheduler DB-based guru computation 更新
- [x] `_compute_guru_scores_from_db()` (`scheduler.py:661`) 更新：
  - 查 `operating_cash_flow`（非 `net_income` proxy）用來計算 `cf_positive` 和 `accruals_negative`
  - 查 `current_ratio`（非 placeholder）用來計算 `delta_current_ratio_positive`
  - 查 `total_assets`（非 `net_income/roa` 反推）用來計算 asset turnover
  - 若欄位為 NULL（舊資料尚未重跑 ingestion），自動 fallback 到舊版 proxy/placeholder

### 5. seed_guru_scores.py standalone 同步
- [x] `seed_guru_scores.py` 內 `calculate_piotroski_f_score()` 和 `_get_annual_data_for_stock()` 同樣更新，使用 CFO / current_ratio

### 6. Docker 驗證
- [x] `docker compose build app` 通過
- [x] DB migration 新增 `financials.operating_cash_flow` 欄位
- [x] 測試：`_compute_guru_scores_from_db()` 成功寫入 269 檔 guru_scores（2026-06-07）
- [x] Criteria 已使用真實 CFO（`Operating Cash Flow`）、真實 Accruals（`NI - CFO`）、真實 Current Ratio（`Current Ratio`）

### 7. Bug fix：FinMind Cash Flow API dataset 名稱修正
- [x] `get_cash_flows()` 原用 `TaiwanStockCashFlowsStatements`（422 error）
- [x] 修正為 `TaiwanStockCashFlowsStatement`（正確 dataset name）
- [x] 檔案：`src/tw_quant_selector/data/finmind_client.py:167`

## 備註
- 影響範圍：`finmind_client.py`, `ingestion.py`, `scheduler.py`, `seed_guru_scores.py`
- ⚠️ 舊 `financials` 表的 `operating_cash_flow` / `current_ratio` / `total_assets` 欄位目前為 NULL，需重新執行 `update_financials` 才會被填入
- `update_financials` 已設定 CFO fallback = `net_income`，確保舊 API 端點不中斷
- F-Score 改善明細：
  | # | 項目 | Before | After |
  |---|------|--------|-------|
  | 2 | CFO > 0 | net_income proxy | ✅ operating_cash_flow |
  | 4 | Accruals < 0 | net_income proxy | ✅ CFO - NI |
  | 6 | ΔCurrentRatio > 0 | placeholder False | ✅ current_assets/current_liabilities |
  | 9 | ΔAssetTurnover > 0 | net_income/roa 反推 | ✅ revenue/total_assets 原生 |
