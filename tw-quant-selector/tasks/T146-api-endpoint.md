---
github_issue: "#101"
title: 更新 API 端點內部實作 (app.py)
type: api
priority: high
status: pending
depends_on: []
assignee: OpenCode with DeepSeek V4 Flash
created: 2025-08-15
updated: 2025-08-15
---

# T146 - 更新 API 端點內部實作 (app.py)

## 目標
將 `src/tw_quant_selector/api/app.py` 中涉及資料讀取的端點改為優先從 MCP 獲取資料，再寫入本地 SQLite/PostgreSQL DB 或 `.stock_monitor.json` 檔案，確保 API 回傳的資料結構與穩定版本完全一致。

## 內容說明
- **修改檔案**: `src/tw_quant_selector/api/app.py`
- **主要變更**:
  - `export_portfolio_endpoint()`：改為先從 MCP `GetPriceHistory` 撷取近期行情，再依原邏輯寫入 `.stock_monitor.json` 與 `stock_monitor.csv`；若 MCP 失敗，保留原有 `scripts/export_portfolio.export_portfolio()` 行為作為 fallback。
  - `import_portfolio_endpoint()`：讀取上傳檔案或重新從 MCP 同步資料後 upsert 入 `portfolio` 表；MCP 寫入失敗時保留原有 DB INSERT ... ON CONFLICT 邏輯。
  - 新增 `/api/v1/mcp/status` 端點：回傳 `{"mcp_healthy": true/false, "transport": "stdio|http", "latency_ms": n}`，供前端狀態面板顯示。
  - 其他portfolio相關端點（DELETE, 報價相關）若涉及讀取個股資料，優先呼叫 MCP client 並做欄位映射。
- **資料結構對照表**: 
  - MCP 欄位 → DB 欄位 → API 回傳欄位
  - `best_four_points` → `portfolio.best_four_points` (新增欄位，預設 `NULL`，避免結構變更)
  - `market_cap`、`float_shares` 等額外欄位 similarly 處理

## 驗收標準
- [ ] `POST /api/v1/portfolio/export` 回傳 `{"status":"success","exported":n}` 且 `.stock_monitor.json` 內容正確（含 MCP 取回的資料或 fallback 來源）
- [ ] `GET /api/v1/mcp/status` 回傳健康狀態
- [ ] `POST /api/v1/portfolio/import` (CSV/JSON) 正常 upsert 入 DB，MCP 失敗時有 fallback
- [ ] 其他 portfolio API 端點（如單股查詢）回傳的欄位名稱與型態未變
- [ ] 單元測試通過：MCP 失敗/成功 兩種情境下的 API 行為

## 備註
- 確保 API 回傳的 JSON Schema 與原穩定版本一致，避免前端資型別錯誤
- 新增的 `/api/v1/mcp/status` 端點僅在開發/調試模式或有 `MCP_TRANSPORT` 環境變數啟用時才返回實際狀態，生產環境可靜默處理
- 對照現有 `tests/test_api.py` 測試，確保不破壞原有測試斷言
- 跨語言對照：MCP 回傳 JSON 欄位與 Python DB 欄位的命名差異，需在 client layer 做好轉換
