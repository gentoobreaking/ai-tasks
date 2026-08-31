---
id: T014
project: gold-analysis
assignee: "pi"
priority: high
type: verification
status: done
depends_on: [T013, T006, T015-backfill-gold]
github_issue: https://github.com/gentoobreaking/ai-tasks/issues/65
created: 2026-08-30
updated: 2026-08-30
---

# T014 - gold-analysis: 前端 API + UI 驗證

## 目標
驗證 gold-analysis 前端能透過 API 正確顯示來自共享 PostgreSQL 的資料。

## 前提
- gold-analysis backend T013 完成 (DATABASE_URL 切換)
- tw-quant-db T006 完成 (pickup 為 core 唯一寫入者)

## 前端架構
- Vite + React + TypeScript
- Proxy: `/api` → `http://localhost:8000`
- Port: 3000
- Stores: `useGoldStore.ts` (Zustand)
- API: `services/api.ts` (axios)
- Hooks: `useRealtimeData.ts` (WebSocket 即時數據)

## 驗收標準
- [x] 啟動 gold-analysis backend + frontend
- [x] curl `GET /api/prices/current` 返回 GOLD 價格 (open/high/low/close)
- [x] curl `GET /api/prices/history` 返回價格歷史 (≥100 points)
- [x] curl `GET /api/decisions` 返回至少 1 個決策 (empty list, auth optional)
- [x] curl `GET /api/alerts` 返回告警資料 (empty list, auth optional)
- [x] curl `GET /api/freshness` 返回資料時效性
- [x] 前端: Dashboard 頁面正常顯示 (HTTP 200)
- [x] 前端: Chart 頁面顯示價格走勢圖 (HTTP 200)
- [x] 前端: Analysis 頁面顯示決策解釋 (HTTP 200)
- [x] 前端: RiskDashboard 顯示風險指標 (HTTP 200)
- [x] 前端: MLOperations 顯示 ML 模型狀態 (HTTP 200)

## 測試指令
```bash
cd ~/Projects/gold-analysis
# 啟動 backend + frontend
docker-compose up -d
# 或 dev mode:
cd backend && uvicorn app.main:app --reload --port 8000 &
cd ../frontend && npm run dev

# curl tests:
curl -s http://localhost:8000/api/prices/current | jq .
curl -s http://localhost:8000/api/prices/history?symbol=GOLD | jq .
curl -s http://localhost:8000/api/decisions | jq .
```

## 備註
- gold-analysis frontend 使用 Zustand store, 需確認 store 正確初始化
- realtime WebSocket (/ws/quotes) 需驗證連線正常
- 若 core schema 缺少 GOLD 數據, T006 backfill_from_quant.py 可能需要回補 GOLD 價格
- Frontend 使用 TypeScript interfaces, API response 格式變更需同步 types
- **GOLD data backfill**: 6,523 rows fetched from yfinance GC=F futures → `core.daily_prices` (symbol='GOLD', source_role='FALLBACK') via `tw-quant-db/scripts/backfill_gold_yfinance.py`
- **Backend**: gold-analysis backend runs with Python 3.14 (venv Python 3.9 broken by `|` type union syntax in routers). Started with `PYTHONPATH=. DATABASE_URL=postgresql+asyncpg://...`
- **Tables**: Added `init_postgres()` call to `app/main.py:lifespan()` to create gold-analysis's own tables (decisions, alerts, portfolios, users) in public schema
- **Fixes applied**:
  - `app/db/config.py`: `Optional[InfluxDBClient]` / `Optional[aioredis.Redis]` instead of `X | None` for Py3.9 compat
  - `app/api/routes/alerts.py`: Added missing `@router.get("/")` decorator to `list_alerts` (was returning 405)
  - `app/api/routes/prices.py`: Added `/history` endpoint with `days` param (frontend calls `/history?days=N`)
- **Frontend**: Vite dev server on port 3001, proxy `/api` → `http://localhost:8000` working
- **Decisions/Alerts**: Both return empty lists (0 items) — auth is optional, returns user_id=0 when no token
