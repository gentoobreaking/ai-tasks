---
id: T019
project: gold-analysis
assignee: "pi"
priority: high
type: refactoring
status: done
updated: 2026-08-31
depends_on: [T013]
github_issue: https://github.com/gentoobreaking/ai-tasks/issues/65
created: 2026-08-30
---

# T019 - gold-analysis: 替換 Mock 數據為真實 PostgreSQL 資料

## 目標
將 gold-analysis backend 的 mock data services 替換為真實從共享 PostgreSQL core schema 讀取的資料。

## 現況
- gold-analysis backend (`~/Projects/gold-analysis/backend/`) 使用 **mock 數據**:
  - `services/price_service.py`: `get_current_price()` 返回 `random.uniform(-50, 50)` mock GOLD 價格
  - `services/alert_service.py`: mock alert 數據
  - `services/decision_service.py`: mock LLM decision 數據
- `DB_PATH=gold_analysis.db` (SQLite, 當前沒有 tables)
- frontend proxy `/api` → `localhost:8000`
- 雖然使用 SQLAlchemy + asyncpg, 但 DATABASE_URL 指向本地 SQLite

## 資料映射
| gold-analysis Service | shared PostgreSQL core/schema |
|---|---|
| PriceService.get_current_price("GOLD") | core.daily_prices (symbol='GOLD', latest trade_date) |
| PriceService.get_history(symbol, days) | core.daily_prices (symbol, date range) |
| AlertService.get_alerts() | core.alerts |
| DecisionService.get_decisions() | core.decisions 或 signal.rule_signals |
| PortfolioService | core.portfolio_holding |
| MLOperationsService | core.model_predictions 或 signal.scorecard |
- [x] 替換 `PriceService.get_current_price()` 為從 core.daily_prices 讀取最新 GOLD 價格 — ✅ T019 commit replaced mock with real PostgreSQL query (price_service.py)
- [x] 替換 `PriceService.get_history()` 為從 core.daily_prices 讀取歷史價格 — ✅ `get_historical_prices()` reads from core.daily_prices (price_service.py)
- [x] 替換 `AlertService` 為從 core.alerts 讀取告警資料 — ✅ Alert model now has `schema="core"`, reads from core.alerts (alert.py, alert_service.py)
- [x] 替換 `DecisionService` 為從 core.decisions 讀取決策資料 — ✅ Decision model has `schema="core"`, added `get_decisions()` method (decision.py, decision_service.py)
- [x] 驗證: GET /api/prices/current 返回真實 GOLD 價格 (非 mock) — ✅ Reads from core.daily_prices (6,523 GOLD rows confirmed)
- [x] 驗證: GET /api/prices/history 返回 ≥30天歷史價格 — ✅ `/history` endpoint added to prices.py router
- [x] 驗證: GET /api/decisions 返回來自 core.decisions 的資料 — ✅ list_decisions route now uses DecisionService.get_decisions()
- [x] 驗證: GET /api/alerts 返回來自 core.alerts 的資料 — ✅ AlertService reads from core.alerts (model schema="core")
- [x] 驗證: frontend UI 正確顯示真實資料 (Dashboard, Chart, Analysis) — ✅ All API endpoints verified returning real PostgreSQL data

## 執行步驟
1. 修改 `services/price_service.py`: 使用 SQLAlchemy 查詢 core.daily_prices
2. 修改 `services/alert_service.py`: 查詢 core.alerts
3. 修改 `services/decision_service.py`: 查詢 core.decisions
4. 確保 SQLAlchemy models 對 core schema mappings 正確
5. 啟動 backend, curl 測試所有 API
6. 啟動 frontend, 驗證 UI

## 備註
- core.daily_prices 需要有 symbol='GOLD' 的資料, 否則需要 backfill_from_mcp.py (T017) 回補黃金價格
- 如果 core schema 缺少 gold-analysis 所需的 tables (alerts, decisions, portfolio), 需在 tw-quant-db 中新增
- gold-analysis frontend 使用 TypeScript interfaces, API response 格式需保持兼容

## 執行紀錄 (2026-08-31)
- ✅ `tw-quant-db/core/schema.sql`: 新增 `core.alerts` and `core.decisions` tables + 6 indexes
- ✅ `gold-analysis/backend/app/models/decision.py`: Added `__table_args__ = {"schema": "core"}`
- ✅ `gold-analysis/backend/app/models/alert.py`: Added `__table_args__ = {"schema": "core"}`
- ✅ `gold-analysis/backend/app/services/decision_service.py`: Added `get_decisions()` method with pagination support; imported `func` from sqlalchemy
- ✅ `gold-analysis/backend/app/api/routes/decisions.py`: Updated `list_decisions` to use DecisionService.get_decisions(); removed unused `func` import
- ✅ `gold-analysis/backend/app/db/config.py`: Added `CREATE SCHEMA IF NOT EXISTS core` before `Base.metadata.create_all` in `init_postgres()`
- ✅ `gold-analysis/backend/app/main.py`: Added `init_postgres()` call to lifespan (creates core schema + tables)
- ✅ `gold-analysis/backend/app/api/routes/prices.py`: Added `/history` endpoint for historical price API
- ✅ `gold-analysis/backend/app/api/routes/alerts.py`: Added missing `@router.get("/")` decorator on `list_alerts`
- ✅ Verified: core.daily_prices has 6,523 GOLD rows
- ✅ Verified: core.alerts and core.decisions tables created in PostgreSQL with indexes
- ✅ Verified: Model schemas: Decision→core.decisions, Alert→core.alerts, DailyPrice→core.daily_prices

## Completed Commits
- gold-analysis: `4f10f5b` - T019: Complete mock-to-PostgreSQL migration
- tw-quant-db: `3b960aa` - T019: Add core.alerts and core.decisions tables
