---
id: T002
project: tw-quant-db
assignee: "pi"
priority: high
type: migration
status: done
depends_on: [T068]
github_issue: https://github.com/gentoobreaking/ai-tasks/issues/65
---

## 目標
各 tw-quant 專案建立 `mergeDB` branch，並修改資料庫連線設定指向共享 PostgreSQL。

## 驗收標準
- [x] tw-quant-pickup: `git checkout -b mergeDB`，修改 `docker-compose.yml` + `DATABASE_URL` 指向 `postgres:5432/twquant_shared` — ✅ mergeDB branch exists, .env DATABASE_URL → shared PostgreSQL
- [x] tw-quant-signal: PostgreSQL backend 已在 T011 commit 實現 — SignalDB 支援 postgresql:// URL，search_path TO signal, pickup, core, public
- [x] tw-quant: `cache` 改選項保留 SQLite fallback — DiskCache 有 dual SQLite/PostgreSQL backend (commit 6a1cd49)
- [x] tw-quant-daybrain: 無 DB 更動，預留接入點 — ✅ 無 mergeDB branch needed (criterion says "no DB changes")
- [x] tw-quant-selector: `git checkout -b mergeDB`，修改 `DATABASE_URL` 指向共用 DB，行情查詢改讀 `core.*` 表 — ✅ mergeDB branch created, DEFAULT_DB_URL uses twquant/twquant_shared, search_path TO selector,core,pickup, MetaData(schema="selector") ensures FK refs resolve to selector.stocks, API starts successfully, can read core.* tables

## 備註
- 各 branch 獨立建立，避免互相干擾
- Phase 1b: pickup 第一個切換（唯一寫入者）
- Phase 2: selector/signal 唯讀接入

## 執行紀錄 (2026-08-31 稽核)
- 已達成 5 項並打勾。
- **未竟事項**: 0 項
- **補充**:
  - tw-quant-selector: `git checkout -b mergeDB` on `25b3982` base → `e96d71c`
  - Updated `DEFAULT_DB_URL` to use `twquant`/`twquant_shared` (shared PostgreSQL credentials)
  - Added `DATABASE_URL` env var support (T002 criterion)
  - Added `search_path=selector,core,pickup` via `connect_args` in SQLAlchemy engine
  - Set `MetaData(schema="selector")` in models.py so ORM tables map to `selector.*` and FK constraints reference `selector.stocks` (not `core.stocks`)
  - Fixed `init_db()` to skip `create_all` when tables already exist, avoiding FK column mismatch
  - Verified: API starts, tables in `selector.*` schema, can read `core.stocks` (11,574 rows)
  - Env var audit: `DATABASE_URL` consumed by `database.py:os.environ.get("DATABASE_URL")` (production code)
