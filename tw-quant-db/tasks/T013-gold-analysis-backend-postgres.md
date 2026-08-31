---
id: T013
project: gold-analysis
assignee: "pi"
priority: high
type: migration
status: done
depends_on: [T006, T010]
github_issue: https://github.com/gentoobreaking/ai-tasks/issues/65
created: 2026-08-30
updated: 2026-08-30
---

# T013 - gold-analysis: Backend 切換到共享 PostgreSQL

## 目標
將 gold-analysis backend 的 DATABASE_URL 更新為共享 PostgreSQL，
並確認 SQLAlchemy models 能讀取 core.* schema。

## 現況
- gold-analysis backend 使用 SQLAlchemy + asyncpg
- DATABASE_URL 預設: `postgresql+asyncpg://user:password@localhost:5432/gold_analysis`
- models 存放在 `backend/app/models/`
- API routes 存放在 `backend/app/api/routes/`
- 目前連接本地 `gold_analysis` 資料庫，需切換到 `twquant_shared`

## 驗收標準
- [ ] 更新 `.env` 中的 DATABASE_URL 為 `postgresql+asyncpg://twquant:twquant-secret-password@localhost:5432/twquant_shared`
- [ ] 驗證 SQLAlchemy models 能查詢 core.* tables (stocks, daily_prices, financials)
- [ ] 驗證: GET /prices/current 返回 GOLD 價格
- [ ] 驗證: GET /prices/history 返回價格歷史
- [ ] 驗證: GET /decisions 返回決策資料
- [ ] 驗證: GET /alerts 返回告警資料
- [ ] 驗證: GET /freshness 返回資料時效性
- [ ] 啟動 backend server (uvicorn), curl 測試所有 endpoints

## 資料映射
| gold-analysis model | shared PostgreSQL |
|---|---|
| GoldPrice (模型) | core.daily_prices (symbol='GOLD') |
| Decision (模型) | core.decisions 或 signal.rule_signals |
| Alert (模型) | core.alerts |
| Portfolio (模型) | core.portfolio_holding |

## 執行步驟
1. 更新 `.env`: DATABASE_URL → shared PostgreSQL
2. 執行 alembic migration 或 SQLAlchemy create_all (schema 已存在)
3. 修改 models/schema mapping (如果 field 不一致需轉換)
4. 驗證 API endpoints 正常返回 core 資料
5. 啟動 backend + frontend dev servers
6. curl 測試所有 API routes

## 備註
- gold-analysis 與 tw-quant-signal 兩套 backend 架構不同:
  - tw-quant-signal: FastAPI + sqlite3 (SignalDB)
  - gold-analysis: FastAPI + SQLAlchemy + asyncpg
- gold-analysis 主要面向黃金 (GOLD) 分析，tw-quant-signal 面向台股
- 共享 PostgreSQL 中的 core.daily_prices 需能支援 GOLD symbol
- 若 core schema 缺少 gold-analysis 所需 tables, 需在 tw-quant-db 中新增 migrations
