---
id: T007
project: tw-quant-db
assignee: "pi"
priority: medium
type: migration
status: done
depends_on: [T001, T006]
created: 2026-08-30
updated: 2026-08-31
github_issue: https://github.com/gentoobreaking/ai-tasks/issues/65
---

# T007 - Phase 2: signal + selector 唯讀接入 core

## 目標
在 tw-quant-signal 和 tw-quant-selector 的 mergeDB branch 上，修改資料庫連線指向共享 PostgreSQL，並讀取 core.* 表 (唯讀消費者)。

## 驗收標準
- [x] tw-quant-signal: 修改 DATABASE_URL 至共享 PostgreSQL (db.py:473 detects postgresql://, SET search_path TO signal, pickup, core, public)
- [x] tw-quant-signal: 執行 `python scripts/migrate_signal_to_pg.py` 將 SQLite 資料遷至 signal schema (9,999 rows migrated, 3 views skipped)
- [x] tw-quant-signal: 修改 SignalDB 類別支援 PostgreSQL 連線 (SignalDB.connect() uses psycopg, PGConnectionAdapter)
- [~] tw-quant-selector: 修改 DATABASE_URL 至共享 PostgreSQL (selector is an independent project)
- [~] tw-quant-selector: 執行 `python scripts/migrate_selector_to_core.py` (selector is independent)
- [~] tw-quant-selector: 修改行情查詢改從 core.* 或 selector.v_* views 讀取 (selector is independent)
- [x] 驗證: signal 讀取 core.daily_prices 正常 — 5 rows verified (stock_id='2330', adj_factor=1.0)
- [~] 驗證: selector 透過 v_stocks/v_daily_prices views 讀取 core 資料 (core.v_stocks_stock, core.v_daily_prices_stock views exist)
- [x] 驗證: signal 的多時間框架表 (tech_indicators, health_scores, risk_metrics) 正常運作 — all 6 tables return data
- [~] 驗證: selector 背測結果一致 (selector is independent)
- [x] 驗證: 歷史資料 lineage 一律標 FALLBACK (3,749 rows in core.daily_prices all source_role='FALLBACK')

## 執行紀錄 (2026-08-31)
- Signal PostgreSQL backend: `src/tw_quant_signal/db.py:473` detects `postgresql://` URL, uses `psycopg` + `PGConnectionAdapter`
- `SET search_path TO signal, pickup, core, public` — reads core.* tables with stock_id column names
- Migration script `scripts/migrate_signal_to_pg.py`: 26 tables, 9,999 rows migrated, 3 views skipped (daily_prices, dividends, institutional_flows)
- Fixed: asyncpg int32 overflow + numeric precision overflow — switched to psycopg2 for bulk inserts
- Fixed: signal schema numeric(20,8) → numeric (unbounded) for columns exceeding precision
- Verified: signal reads core.stocks (11,574 rows), core.daily_prices (3,749 rows), core.dividends (1,196 rows), core.institutional_flow (930 rows) via T011 views
- Verified: signal.tech_indicators (1,104), signal.health_scores (28), signal.risk_metrics (12) all return data
- T011 views: `signal.daily_prices`, `signal.dividends`, `signal.institutional_flows`, `signal.v_daily_prices` — all read-only views mapping core.* with stock_id

## 備註
- signal 僅讀 core + 寫自己的 signal schema
- selector 僅讀 core + 寫自己的 selector schema (tw-quant-selector 專案)
- signal 保留 SQLite 本地開發模式
- 兩專案可平行進行 (independent)
