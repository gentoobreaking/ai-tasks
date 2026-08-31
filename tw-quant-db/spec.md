# tw-quant-db Project Specification

> 產品規格書 — tw-quant-db (shared PostgreSQL schema + migration/backfill)

## 1. 產品概述

### 產品目標
tw-quant-db 是 tw-quant 生態系的**資料層倉庫**，集中管理共享 PostgreSQL 的 schema 定義、migration 腳本與 data backfill 工具。它將原先分散在多個 SQLite 資料庫中的台股資料整合到一個共享 PostgreSQL 實例中，使各子系統（pickup、selector、signal、daybrain、mcp）擁有統一的資料存取層。

### 主要使用者
- **tw-quant-pickup** (data writer / core 唯一寫入者)
- **tw-quant-signal** (read-only consumer via compatibility views)
- **tw-quant-selector** (read-only consumer via stock_id views)
- **tw-quant-mcp** (data source for backfill)

### 核心情境
1. 新建 PostgreSQL 共享實例 → 建立 5 個 schema + 8 張 core fact tables
2. 將既有 tw-quant-pickup 的 SQLite/PG 資料遷移到 core schema
3. 從 tw-quant-mcp 的 cache.db 回補歷史資料到 core schema (source_role='FALLBACK')
4. 其他專案透過 SQL 查詢 core.* / pickup.* / signal.* / selector.* 存取資料

## 2. 架構

### 系統組件

| 組件 | 位置 | 責任 |
|---|---|---|
| Schema 定義 | `core/schema.sql`, `pickup/schema.sql` | 所有表格的 DDL + indexes + constraints |
| 初始化腳本 | `init-scripts/01-create-schemas.sql` | Docker entrypoint：建立 5 個 schema |
| Migration 腳本 | `migrations/T01X-*.sql` | 增量 schema migration |
| 遷移工具 | `scripts/migrate_to_core.py` | 將 pickup 資料複製到 core |
| Backfill 工具 | `scripts/backfill_from_mcp.py` | 從 cache.db 回補資料到 core (FALLBACK) |
| Signal 遷移 | `scripts/backfill_from_signal.py`, `scripts/migrate_signal_to_pg.py` | 從 signal SQLite 遷移資料 |
| Docker | `docker-compose.yml` | PostgreSQL 16 + pgAdmin |

### 資料流程

```
tw-quant-mcp/cache.db ──┐
                        ├──> scripts/backfill_from_mcp.py ──> core.* (FALLBACK)
tw-quant-signal SQLite ─┤
                        ├──> scripts/backfill_from_signal.py ──> core.* (FALLBACK)
tw-quant-pickup PG ────┤
                        ├──> scripts/migrate_to_core.py ──> core.* (migrate existing)
                        └──> (running pipeline) ──> core.* (CANONICAL, real-time)

selector.* / signal.* views ── 讀取 core.* (read-only)
```

### Schema 分層

| Schema | 所有者 | 說明 | 存取模式 |
|---|---|---|---|
| `core` | tw-quant-pickup (唯一寫入者) | raw/fact tables — 單一事實來源 | 全部專案唯讀 |
| `pickup` | tw-quant-pickup | business logic 表格 (factor_scores, rankings, alert_log 等) | pickup 讀寫 |
| `selector` | tw-quant-selector | portfolio, backtest, alerts | selector 讀寫 |
| `signal` | tw-quant-signal | technical indicators & health scores | signal 讀寫 |
| `audit` | shared | operation_logs (all projects) | 全部專案唯讀 |

### Search Path 策略

| 組件 | search_path 設定 | 理由 |
|---|---|---|
| `db/migrate.py` (pickup) | `SET search_path TO pickup, core` | 建立表格時 default 在 pickup schema |
| `db/repository.py` (pickup) | `SET search_path TO core, pickup` | fact tables 解析為 core.*，business tables 解析為 pickup.* |
| `collectors/base.py` (pickup) | `SET search_path TO core, pickup` | collector 寫入 core.* fact tables |
| `api/db.py` (pickup) | `SET search_path TO core, pickup` | API 讀 core.* fact tables，寫 pickup.* business tables |
| `scripts/auto_daily.py` | `SET search_path TO core, pickup` | daily pipeline 讀 core.* |
| `api/routers/market.py` | (inherited from api/db.py) | — |

## 3. 功能需求

### 3.1 Schema 管理 (T001)

**FR-3.1.1**: 建立 5 個 schema (core, pickup, selector, signal, audit)
- **驗證**: `init-scripts/01-create-schemas.sql` 執行成功 → `SELECT schema_name FROM information_schema.schemata`

**FR-3.1.2**: core schema 包含 8 張 fact tables
- core.stocks, core.daily_prices, core.financials, core.monthly_revenues, core.dividends, core.institutional_flow, core.market_context, core.margin_trading, core.universe_flags

**FR-3.1.3**: 每張 core 表格必須包含 lineage 三欄 + source_role
- `source VARCHAR(100)`, `data_date DATE`, `freshness VARCHAR(30)`, `source_role VARCHAR(30) NOT NULL DEFAULT 'CANONICAL'`

**FR-3.1.4**: source_role 必須受 CHECK constraint 限制
- `CHECK (source_role IN ('CANONICAL', 'SEMI_OFFICIAL_REALTIME', 'FALLBACK'))`

### 3.2 Pickup PostgreSQL 切換 (T006)

**FR-3.2.1**: pickup migrations 在 PostgreSQL 上建立表格到 `pickup.*` schema
- migration runner (`db/migrate.py`) 設定 `SET search_path TO pickup, core`

**FR-3.2.2**: application code 設定 `SET search_path TO core, pickup`
- `db/repository.py`, `collectors/base.py`, `api/db.py`, `scripts/auto_daily.py`

**FR-3.2.3**: `migrate_to_core.py` 將 pickup.* 資料複製到 core.*
- 使用 `INSERT INTO core.{table} SELECT * FROM pickup.{table}`
- 跳過已有資料的表格 (check core table row count > 0)

**FR-3.2.4**: 建立 compatibility views 讓 selector 專案使用 `stock_id` column
- `core.v_daily_prices_stock`, `core.v_stocks_stock`, `core.v_financials_stock`, `core.v_monthly_revenue_stock`

**FR-3.2.5**: cursor-is-closed bug 修復 (api/routers/market.py)
- `fetchone()` 必須在 `with conn.cursor()` block 內執行

**FR-3.2.6**: 整合測試必須設定 search_path
- 所有 integration test fixtures 必須 `SET search_path TO core, pickup`

### 3.3 MCP Cache Backfill (T017)

**FR-3.3.1**: `backfill_from_mcp.py` 從 tw-quant-mcp cache.db 匯入資料到 core
- 支援 datasets: financials, daily_kline, dividend, monthly_revenue, institutional, foreign_holding, calendar(stocks), margin

**FR-3.3.2**: 所有回補資料標記 source_role='FALLBACK'
- 每張表格插入時帶入 `source_role='FALLBACK'`

**FR-3.3.3**: 使用 INSERT ON CONFLICT DO NOTHING 防止覆蓋既有資料
- 確保 CANONICAL 資料 (來自 pickup pipeline) 不被 FALLBACK データ上覆蓋

**FR-3.3.4**: margin 資料回補到 core.margin_trading
- margin dataset 有兩種格式: stock-level (code/name + margin_buy/sell/balance) 和 market aggregate (_date/_table)
- 僅匯入 stock-level 資料；skip market aggregate

**FR-3.3.5**: daily_kline key reversal
- candle 資料沒有 stock code in value，需要從 cache key 反推 (key 格式: TWSE_WEB|daily_k|data_date|symbol|params_hash)
- 若無法反推 stock code，skip 該 entry

**FR-3.3.6**: value 解碼支援多種格式
- Raw bytes (JSON string as bytes)
- Double-encoded: bytes → JSON string literal → base64-encoded JSON → JSON
- Plain string (JSON)

**FR-3.3.7**: backfill 後驗證
- 驗證各表格 row count + FALLBACK count

### 3.4 Signal 遷移 (T009, T011)

**FR-3.4.1**: `backfill_from_signal.py` 從 signal SQLite 匯入資料到 core
- 支援 datasets: financials, daily_prices, stocks, monthly_revenues, dividends, institutional, universe, alerts, factor_scores

**FR-3.4.2**: `migrate_signal_to_pg.py` 將 signal SQLite → PostgreSQL
- 建立 signal.* tables in PostgreSQL, copy data from SQLite

**FR-3.4.3**: T011 signal views mapping
- `signal.daily_prices` → core.daily_prices (symbol→stock_id, adjusted_close→adj_close, turnover→amount)
- `signal.dividends` → core.dividends (symbol→stock_id, fiscal_year→year)
- `signal.institutional_flows` → core.institutional_flow (symbol→stock_id, column mapping)

### 3.5 DiskCache PostgreSQL (T018)

**FR-3.5.1**: tw-quant `common/cache.py` DiskCache 支援 PostgreSQL backend
- 當 DATABASE_URL 環境變數設定時，自動切換到 PostgreSQL (pickup.cache 表格)
- PostgreSQL 使用 autocommit=True 確保多執行緒安全

**FR-3.5.2**: SQLite 仍為 fallback (local dev)
- 無 DATABASE_URL 時使用 SQLite

**FR-3.5.3**: `pickup.cache` 表格結構
- `key TEXT PRIMARY KEY, data TEXT, ts REAL`

**FR-3.5.4**: DiskCache.get() 在 cache miss 時正確回傳 fetch_fn() 結果
- 必須 `return val` 而非回傳 None

### 3.6 Docker Compose (T005)

**FR-3.6.1**: docker-compose.yml 定義 PostgreSQL + pgAdmin
- `container_name: twquant-shared-postgres`
- `container_name: twquant-pgadmin`
- secrets: `pg_password` (from `secrets/postgres_password.txt`), `pgadmin_password` (from `secrets/pgadmin_password.txt`)

## 4. 非功能需求

### 可靠性
- Schema 建立 idempotent: `CREATE TABLE IF NOT EXISTS` + `DO $$ BEGIN ... IF NOT EXISTS ... END $$`
- Backfill 可中斷續跑: 使用 `INSERT ON CONFLICT DO NOTHING`

### 資料一致性
- core.stocks: 11,211 筆 (verified 2026-08-31)
- core.financials: 3,462 筆 (4,215 cache entries → 32,036 records → 3,462 unique)
- core.daily_prices: 65 筆 (77 cache entries, 62 candle entries skipped)
- core.dividends: 1,196 筆
- core.monthly_revenues: 890 筆
- core.institutional_flow: 923 筆
- core.margin_trading: 1,295 筆 (from 3 margin cache entries)

### 安全性
- secrets/ 目錄在 .gitignore 中，不納入版本控制
- PostgreSQL 使用 Docker secrets (POSTGRES_PASSWORD_FILE) 而非 plaintext env

### 可維護性
- 每個 migration 都有對應的 SQL 檔案 (migrations/TXXX-*.sql)
- Spec 參考 (§5.1-5.6, §7, §8.1) 在 core/schema.sql 註釋中

## 5. API / Interface

### 環境變數

| Variable | Default | 用途 |
|---|---|---|
| `DATABASE_URL` | `postgresql://localhost:5432/twquant_shared` | PostgreSQL 連線字串 (backfill scripts + DiskCache) |
| `MCP_CACHE_DB` | `~/Projects/tw-quant-mcp/data/cache.db` | MCP cache.db 路徑 |
| `SIGNAL_SQLITE_DB` | (none) | Signal SQLite 資料庫路徑 |
| `FINMIND_TOKEN` | (none) | FinMind API token (pipeline_screener.py) |

### CLI Commands

```bash
# 建立 core schema + migrate pickup 資料
DATABASE_URL="..." python3 scripts/migrate_to_core.py

# 從 MCP cache.db 回補資料
DATABASE_URL="..." python3 scripts/backfill_from_mcp.py
DATABASE_URL="..." python3 scripts/backfill_from_mcp.py --dry-run

# 從 signal SQLite 遷移
DATABASE_URL="..." SIGNAL_SQLITE_DB="..." python3 scripts/migrate_signal_to_pg.py
DATABASE_URL="..." SIGNAL_SQLITE_DB="..." python3 scripts/backfill_from_signal.py
```

### Docker

```bash
docker compose up -d    # 啟動 PostgreSQL 16 + pgAdmin
docker compose down     # 停止容器 (保留 data volume)
```

## 6. 資料模型

### core.stocks
- PK: `symbol VARCHAR(10)`
- 公司基本資訊 (name, market, sector, industry, security_type, listed_date, active, created_at, updated_at)

### core.daily_prices
- PK: `(symbol, trade_date)`
- OHLCV: open, high, low, close, adjusted_close, volume, turnover
- Lineage: source, data_date, freshness, source_role

### core.financials
- PK: `(symbol, fiscal_year, fiscal_quarter, revision)`
- 財務報表: revenue, gross_profit, operating_income, net_income, eps, book_value_per_share
- 資產負債: total_assets, total_liabilities, equity
- 現金流: operating_cash_flow, investing_cash_flow, capex, free_cash_flow
- 其他: roe, roa, reported_at, observed_at, source, source_timestamp, data_date, freshness, source_role

### core.monthly_revenues
- PK: `(symbol, year_month)`
- revenue, yoy_growth, mom_growth, cumulative_revenue, reported_at, observed_at, source, data_date, freshness, source_role

### core.dividends
- PK: `(symbol, fiscal_year)`
- cash_dividend, stock_dividend, payout_ratio, ex_date, payment_date, source, data_date, freshness, source_role

### core.institutional_flow
- PK: `(symbol, trade_date)`
- foreign_net, investment_trust_net, dealer_net, total_net, availability_date, source, data_date, freshness, source_role

### core.margin_trading
- PK: `(symbol, trade_date)`
- margin_buy, margin_sell, margin_balance, margin_limit, short_buy, short_sell, short_balance, short_limit, offset (quoted: PostgreSQL reserved word)
- source, data_date, freshness, source_role

### core.market_context
- PK: `(context_type, symbol, trade_date)`
- 選擇權/期貨市場 context: close, change, change_percent, call/put volumes/OI, contract info
- payload JSONB for extensible data

### core.universe_flags
- PK: `(symbol, flag_date)`
- attention, disposition, disposition_reason, suspended

## 7. 已知限制 (Known Limitations)

1. **backfill_from_mcp.py margin**: 3 cache entries, 1 undecodable (different encoding format), 2 stock-level (1,295 records). Market aggregate entries (_table format) are skipped.
2. **backfill_from_mcp.py daily_kline**: 62 of 77 cache entries are candle data requiring key reversal; some keys cannot be reversed due to missing stock code info, resulting in 65 unique rows.
3. **backfill_from_mcp.py financials**: 4,215 cache entries → 32,036 records → 3,462 unique rows after ON CONFLICT DO NOTHING dedup.
4. **tw-quant-pickup vs tw-quant**: T018 (DiskCache PostgreSQL) is implemented in the `tw-quant` project, not `tw-quant-db`. This repo only defines the `pickup.cache` table schema.
5. **No test suite in this repository**: Integration tests live in `tw-quant-pickup/tests/integration/`.
6. **secrets/ directory**: gitignored; password files must be created manually.

## 8. 參考資料

- Spec: `core/schema.sql` 內含 §5.1-5.6 table 定義, §7 source_role, §8.1 constraints
- Task books: `~/tasks/tw-quant-db/tasks/T00[1-9]*.md`, `T01[0-9]*.md`
- Status report: `~/Projects/tw-quant-db-status.md`
