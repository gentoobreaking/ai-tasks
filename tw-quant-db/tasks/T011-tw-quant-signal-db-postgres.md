---
id: T011
project: tw-quant-signal
assignee: "pi"
priority: high
type: migration
status: done
depends_on: [T006]
created: 2026-08-30
updated: 2026-08-31
---

# T011 - tw-quant-signal: SignalDB 切換到 PostgreSQL

## 目標
將 tw-quant-signal 的 SignalDB 類別從 SQLite 切換到共享 PostgreSQL，
使 API 伺服器能讀取 core.* schema。SignalDB 保持唯讀 core，
業務資料寫入 signal schema。

## 現況
- SignalDB (`src/tw_quant_signal/db.py`) 使用 `sqlite3` 直接操作 `data/signal.db`
- 所有 API endpoints 透過 `_get_db()` → `SignalDB()` 存取資料
- 主要 tables: daily_prices, signals, tech_indicators, health_scores, financial_data, dividends, margin_trading, institutional_flows

## 資料映射 (SQLite → shared PostgreSQL)
| SQLite table (signal schema) | PostgreSQL core table |
|---|---|
| daily_prices (3,663 rows) | core.daily_prices (已回補) |
| signals | signal.rule_signals |
| tech_indicators (1,104) | signal.tech_indicators |
| health_scores (28) | signal.health_scores |
| financial_data (9) | core.financials |
| quarterly_financials | core.financials |
| dividends | core.dividends |
| margin_trading | core.margin_trading |
| institutional_flows | core.institutional_flow |

## 驗收標準
- [x] SignalDB 支援 PostgreSQL 模式 (DATABASE_URL 環境變數)
- [x] 切換環境變數 `TW_QUANT_DB=postgresql://twquant:pwd@localhost:5432/twquant_shared`
- [x] 所有 read-only API endpoints (list_stocks, stock_detail, dashboard) 正常返回資料
- [x] 寫入 signal schema 的 operations (save_signal, save_health_score) 仍正常
- [x] 驗證: `GET /api/stocks` 返回 ≥11 樣 (watch_stocks)
- [x] 驗證: `GET /api/stocks/2330/detail` 返回完整資料 (price, health, tech indicators)
- [x] 驗證: `GET /api/dashboard` 返回 market_state + 股票列表

## 執行紀錄 (2026-08-31)
- `src/tw_quant_signal/db.py`: `PGConnectionAdapter` with `?` → `%s` parameter translation (already implemented)
- Fixed: `init_db()` now skips `_init_schema()` in PostgreSQL mode (schema managed by tw-quant-db migrations)
- SignalDB detects PostgreSQL via `db_path.startswith("postgresql://")`
- `SET search_path TO signal, pickup, core, public` in `PGConnectionAdapter`
- API server started with `TW_QUANT_DB=postgresql://twquant:twquant-secret-password@localhost:5432/twquant_shared`
- All 3 endpoints tested: `/api/stocks` (200), `/api/stocks/2330/detail` (200), `/api/dashboard` (200)
- Signal schema tables populated: 23 tables, 9,999 rows (T007/T009)
- T011 views: `signal.daily_prices`, `signal.dividends`, `signal.institutional_flows`, `signal.v_daily_prices`

## 備註
- SignalDB 的 `_init_schema()` 在 PostgreSQL 模式下跳過 (schema 由 migration scripts 建立)
- stock_id (signal) ↔ symbol (core) 映射: 直接使用相同值
- SignalDB 必須支援雙模式 (SQLite 本地開發 + PostgreSQL 生產)
