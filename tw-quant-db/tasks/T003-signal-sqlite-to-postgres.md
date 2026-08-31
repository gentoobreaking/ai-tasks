---
id: T003
project: tw-quant-db
assignee: "pi"
priority: medium
type: migration
status: done
depends_on: [T068]
github_issue: https://github.com/gentoobreaking/ai-tasks/issues/65
---

## 目標
將 tw-quant-signal 的 SQLite schema 移植到 PostgreSQL `signal` schema，
作為 core 的唯讀消費者。signal 的多時間框架表、健診評分、風險指標等業務表
存放於 `signal` schema，不併入 core。

## 驗收標準
- [ ] `signal/schema.sql` — 將 SQLite schema (db.py: _init_schema) 轉為 PostgreSQL DDL
  - `TEXT` → `VARCHAR`/`TEXT`
  - `REAL` → `NUMERIC(20,8)`
  - `INTEGER` → `BIGINT`/`INTEGER`
  - `AUTOINCREMENT` → `BIGSERIAL`/`IDENTITY`
  - `stock_id` → `symbol`（與 core 統一，或留在 signal schema 用 stock_id）
- [ ] `signal/migrate_sqlite_to_pg.py` — 從 SQLite 匯出資料到 PostgreSQL
- [ ] signal 程式碼修改 `SignalDB` class 以支援 PostgreSQL 連線
- [ ] 驗證：signal 讀取 core.daily_prices 取得行情資料（唯讀）
- [ ] 驗證：本地開發仍可用 SQLite

## 備註
- signal 的 `stock_id` 可保留不改，僅接 core 行情資料時做符號對應
- 移植前需在 staging 環境驗證回測結果一致性
