---
github_issue: https://github.com/gentoobreaking/ai-tasks/issues/659
title: 後端 API 前端強化
type: feature
priority: medium
status: done
assignee: gemini-3-flash-preview
created: 2026-05-26
updated: 2026-05-26
howto: |
  1. Wrap all API responses in standardized ApiResponse wrapper (spec §9.2 interface)
     - { data, meta: { generated_at, data_as_of, request_id }, error?: { code, message } }
  2. Add new endpoints needed by frontend:
     - GET /api/v1/signals?date=&include_etf=&top_n=  — with rank_change, factor scores breakdown, consecutive_days
     - GET /api/v1/signals/calendar — list available signal dates (for date picker)
     - GET /api/v1/stock/{id}/factor-history — 52-week factor score time series
     - GET /api/v1/portfolio — current simulated portfolio state
     - GET /api/v1/monitor/datasets — dataset coverage details for monitor page
     - GET /api/v1/monitor/logs — recent operation logs
     - GET /api/v1/backtest/{run_id}/detail — full backtest detail including trades
  3. Add CSV export endpoint: GET /api/v1/signals/export.csv
  4. Add request_id (uuid) to all responses for tracing
  5. Update existing endpoints to new response format
  6. Ensure CORS allows frontend dev server origin
---

# T025 - Backend API Enhancement for Frontend

## 目標
強化後端 API 以支援前端頁面的完整需求，包括標準化回應格式、新增端點、CSV 匯出與 CORS 設定。

## 驗收標準
- [x] 所有 API 回應皆包裹在 `{ data, meta, error }` 標準格式中
- [x] `meta` 包含 `generated_at`、`data_as_of`、`request_id`
- [x] 錯誤回應格式符合 `{ error: { code, message } }`
- [x] `GET /api/v1/signals` 支援 `?date=&include_etf=&top_n=` 參數，回傳含 factor_scores 細項、rank_change、consecutive_days
- [x] `GET /api/v1/signals/calendar` 回傳有資料的交易日清單
- [x] `GET /api/v1/stock/{id}/factor-history` 回傳近 52 週每日因子分數時間序列
- [x] `GET /api/v1/monitor/datasets` 回傳各資料集的覆蓋率、缺失日、最後更新時間
- [x] `GET /api/v1/monitor/logs` 回傳近 7 日操作日誌
- [x] `GET /api/v1/signals/export.csv` 可直接下載 CSV 格式訊號資料（檔名格式 `tw_signals_YYYYMMDD.csv`）
- [x] `GET /api/v1/signals/export.json` 可直接下載 JSON 格式訊號資料（含 meta 元資料）
- [x] 匯出支援欄位選擇（預設所有可見欄位，可額外加入市值等隱藏欄位）
- [x] CORS 允許 `http://localhost:5173`（Vite 預設 port）
- [x] 所有現有端點的回應格式已更新且不破壞相容性

## 備註
- 參考 spec §9.2 API 對接規格、§5.4 資料匯出
- 建議新增 `middleware.py` 統一處理 response wrapper 與 request_id
- CSV 匯出使用 Python csv 模組（streaming response）
- JSON 匯出格式須符合 frontend Signal interface（spec §9.2）
