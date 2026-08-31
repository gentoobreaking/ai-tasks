---
id: T010
project: tw-quant-db
assignee: "pi"
priority: medium
type: migration
status: done
depends_on: [T006, T007]
github_issue: https://github.com/gentoobreaking/ai-tasks/issues/65
created: 2026-08-30
updated: 2026-08-30
---

# T010 - Frontend migration: 切換資料來源到共享 PostgreSQL

## 目標
將前端應用的 API 呼叫改為讀取共享 PostgreSQL 的 core schema，
而非原先的 SQLite/本地資料庫。前端本身 (Vite+React) 不直接連資料庫，
而是透過後端 API — 因此修改點在 API 伺服器的資料庫層。

## 前提
- tw-quant-signal: FastAPI 伺服器 (`src/tw_quant_signal/api/app.py`) 使用 `SignalDB()` 類別讀取 SQLite `data/signal.db`
- gold-analysis: FastAPI 伺服器 (`backend/`) 使用 SQLAlchemy 連接 `gold_analysis` PostgreSQL
- 前端 proxy: `/api` → `http://localhost:8000`

## 驗收標準
- [ ] tw-quant-signal: SignalDB 類別支援 PostgreSQL 連線 (DATABASE_URL 環境變數)
- [ ] tw-quant-signal: API endpoints 切換為讀 core.* schema (唯讀)
- [ ] tw-quant-signal: frontend API client (`/api/*`) 不變，向後相容
- [ ] tw-quant-signal: vite.config.ts proxy 指向共享 PostgreSQL 容器 (port 5432)
- [ ] gold-analysis: backend DATABASE_URL 更新為 `postgresql://twquant:pwd@localhost:5432/twquant_shared`
- [ ] gold-analysis: backend 讀 core.* schema (唯讀，schema=switch to core)
- [ ] gold-analysis: frontend /api 路由回傳 core 資料
- [ ] 驗證: tw-quant-signal frontend 能正常載入 stocks/price charts
- [ ] 驗證: gold-analysis frontend 能正常載入價格/技術指標
- [ ] 驗證: 兩前端皆可正確顯示回補資料 (core.daily_prices)

## 執行順序
1. tw-quant-signal: 修改 db.py 支援 PostgreSQL + 環境變數切換
2. tw-quant-signal: API app.py 切換 SignalDB 為 PostgreSQL 模式
3. gold-analysis: 更新 backend .env 中的 DATABASE_URL
4. gold-analysis: 驗證 SQLAlchemy models 對 core schema 的兼容性
5. 前端測試：啟動 dev servers (signal: 8000/5173, gold-analysis: 8000/3000)
6. 驗證 API 回應正確 (curl /api/stocks, /api/dashboard)

## 備註
- tw-quant-signal 的 SignalDB 使用 sqlite3，需重構支援 asyncpg/psycopg2 PostgreSQL
- tw-quant-signal 僅讀 core.*，寫入 signal schema (tech_indicators, health_scores 等)
- gold-analysis backend 已使用 SQLAlchemy，可以透過 DATABASE_URL 切換
- frontend 不需修改，除非 API response 格式改變
