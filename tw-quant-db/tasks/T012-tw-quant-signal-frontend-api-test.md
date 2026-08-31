---
id: T012
project: tw-quant-signal
assignee: "pi"
priority: high
type: verification
status: done
depends_on: [T011]
created: 2026-08-30
updated: 2026-08-31
---

# T012 - tw-quant-signal: 前端 API 驗證

## 目標
驗證 tw-quant-signal 前端能透過 API 正確顯示來自共享 PostgreSQL 的資料。

## 前提
- tw-quant-signal backend T011 完成 (SignalDB 切換到 PostgreSQL)
- Shared PostgreSQL 正常運行 (twquant-shared-postgres container)

## 驗收標準
- [x] 啟動 tw-quant-signal dev server (API + frontend)
- [x] curl `GET /api/stocks` 返回 11 檔股票 (watch_stocks list)
- [x] curl `GET /api/stocks/2330/detail` 返回價格(120 rows)+技術指標(120 rows)+財報(1 row)
- [x] curl `GET /api/dashboard` 返回市場狀態 + 股票列表 (11 stocks)
- [x] curl `GET /api/health` 返回 200 (0 entries — no health scores for today 2026-08-31)
- [x] 前端瀏覽器驗證: http://localhost:5173 正常載入 (200)
- [x] 前端驗證: API proxy 正常 (via frontend proxy → localhost:8000)

## 執行紀錄 (2026-08-31)
- API server: `uvicorn src.tw_quant_signal.api.app:app --host 127.0.0.1 --port 8000`
- Frontend server: `npx vite preview --host 127.0.0.1 --port 5173`
- TW_QUANT_DB=postgresql://twquant:twquant-secret-password@localhost:5432/twquant_shared
- vite.config.ts proxy: `/api` → `http://localhost:8000` (no changes needed)
- All endpoints return 200 with data from PostgreSQL

## 備註
- 前端 proxy (/api → localhost:8000) 不需修改
- API response 格式與 SQLite 模式相同 (PGConnectionAdapter handles ? → %s conversion)
- 驗證數據: core.daily_prices 中的 2330 資料 (3,749 rows 包含 2330)
