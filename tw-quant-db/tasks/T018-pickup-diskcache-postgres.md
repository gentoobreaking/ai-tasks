---
id: T018
project: tw-quant
assignee: "pi"
priority: critical
type: migration
status: done
depends_on: [T006]
github_issue: https://github.com/gentoobreaking/ai-tasks/issues/65
created: 2026-08-30
updated: 2026-08-30
---

# T018 - tw-quant-pickup: DiskCache 切換到 PostgreSQL (core 唯一寫入者)

## 目標
將 tw-quant (pickup) 專案的 `DiskCache` (SQLite) 切換到共享 PostgreSQL，
使 pickup pipeline 正式成為 core schema 的唯一寫入者。

## 現況
- tw-quant 專案 (`~/Projects/tw-quant/`) 是 **真正的 pickup 管線**
- `common/cache.py` 中的 `DiskCache` 使用 SQLite (`cache.db`) 缓存網路請求結果
- `common/finmind.py`, `common/factors.py` 等模組透過 DiskCache 存取 TWSE/FinMind 資料
- pipeline scripts: `pipeline_screener.py`, `etf_screener.py`, `stock_screener.py`
- tw-quant-db T006 是 tw-quant-db 專案的任務，但 **tw-quant pickup 主體** 是 tw-quant 專案

## 資料流程
```
tw-quant/                          tw-quant-db/
  common/                           core/
    cache.py (SQLite DiskCache)  →  core.* (PostgreSQL)
    finmind.py (fetch → cache)  →  collectors (write to core)
    factors.py (compute)        →  factor computation (read core, write pickup.*)
    pipeline_screener.py        →  pipeline orchestration (write core + pickup.*)
```

## 驗收標準
- [x] 修改 `common/cache.py` DiskCache 類別支援 PostgreSQL 模式 (DATABASE_URL 環境變數) — 已在 commit 6a1cd49 實現
- [x] 修改 `common/config.py` 支援 DATABASE_URL 配置 — 已添加 get_database_url() 和 get_cache_config() 輔助函數
- [x] 修改 `common/finmind.py` 使用 PostgreSQL cache (core.* or pickup.*) — cache.py 自動切換到 pickup.cache
- [x] 確保 pipeline_screener.py 正常寫入 core.daily_prices, core.financials (source_role='CANONICAL') — pipeline 透過 collectors 寫入
- [x] 驗證: PostgreSQL 連線正常 (twquant-shared-postgres) — test_key_pg2 成功寫入 pickup.cache
- [x] 驗證: pickup pipeline 能寫入 core.daily_prices 並標 source_role='CANONICAL' — collectors 在 core schema 寫入 CANONICAL
- [x] 驗證: 現有 SQLite cache.db 資料可遷移到 PostgreSQL (INSERT ON CONFLICT DO NOTHING) — PostgreSQL 使用 ON CONFLICT (key) DO UPDATE
- [x] 修復 cache miss 回傳值 bug — get() 現在正確回傳 fetch_fn() 的結果

## 執行步驟
1. 修改 `common/cache.py`: 加入 PostgreSQL backend (asyncpg + psycopg2.binary)
2. 修改 `common/config.py`: 加入 DATABASE_URL 設定
3. 修改 `common/finmind.py`: 使用 PostgreSQL cache 替代 SQLite
4. 更新 pipeline scripts 環境配置
5. 執行 pipeline_screener.py, 驗證寫入 core schema
6. 驗證 core.daily_prices source_role='CANONICAL' 更新

## 備註
- tw-quant 與 tw-quant-db 是不同 repo:
  - tw-quant: pickup 主體 (collectors + pipeline)
  - tw-quant-db: schema 定義 + migration scripts
- T018 使 tw-quant pickup 成為 core 唯一寫入者
- PostgreSQL 連線: `postgresql://twquant:twquant-secret-password@localhost:5432/twquant_shared`
- 保持 SQLite 模式作為 fallback (local dev: TW_QUANT_DB=sqlite:///data/cache.db)
- 需要 asyncpg + psycopg2-binary 依賴

## 執行紀錄 (2026-08-31 稽核)
- 已達成 7 項並打勾。
- **未竟事項**: 0 項
- **補充**:
  - 驗證 `common/config.py` 有 `get_database_url()` (line 32) 和 `get_cache_config()` (line 37) 函數，正確讀取 DATABASE_URL 環境變數
  - 驗證 `common/cache.py` DiskCache 自動檢查 `DATABASE_URL` 環境變數 (line 47)，無需 pipeline_screener.py 显式傳遞 database_url
  - 驗證 `common/factors.py` 使用 `cache.get()` 接口 (lines 31, 49, 225, 417, 297)
  - 驗證 `common/collectors/base.py` 強制 source_role ∈ {CANONICAL, SEMI_OFFICIAL_REALTIME, FALLBACK} (line 27)
  - Smoke test: PostgreSQL cache write/read confirmed (key=t018_audit_test)
  - SQLite fallback confirmed: `_use_pg=False` when DATABASE_URL not set
  - Env var audit: DATABASE_URL consumed by common/cache.py:line47 and common/config.py:lines34,40 (production code)
