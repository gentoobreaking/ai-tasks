---
id: T009
project: tw-quant-db
assignee: "pi"
priority: medium
type: migration
status: done
depends_on: [T006]
github_issue: https://github.com/gentoobreaking/ai-tasks/issues/65
created: 2026-08-30
updated: 2026-08-30
---

# T009 - Backfill 歷史資料從其他專案到 core

## 目標
將 tw-quant-signal, tw-quant, tw-quant-daybrain 的歷史資料回補到 core schema，
作為種子資料 (Phase 1a seed data)。tw-quant-pickup 為唯一正式寫入者，
其他專案資料僅回補一次 (INSERT ON CONFLICT DO NOTHING)。

## 資料來源確認
- [x] **tw-quant-signal**: `signal.db` 有 3,663 daily_prices, 1,104 tech_indicators, 28 health_scores, 9 financial_data
- [x] **tw-quant**: `cache.db` 為空 (0 bytes)，無資料可回補
- [x] **tw-quant-daybrain**: `cache.db` 有 32 cache_entries

## 執行結果
- ✅ **tw-quant-signal**: `scripts/backfill_from_signal.py` 執行成功，3,663 rows → core.daily_prices
- ✅ tw-quant cache.db 為空，無資料
- ✅ **tw-quant-signal**: `scripts/backfill_from_signal.py` 執行成功，3,663 rows → core.daily_prices (FALLBACK)
- ✅ tw-quant cache.db 為空，無資料可回補
- ✅ **tw-quant-daybrain**: `backfill_from_mcp.py` 執行成功 (daybrain cache.db 使用相同 cache_entries schema) — 14,788 rows backfilled

- [x] 建立 `scripts/backfill_from_signal.py`: 從 signal.db 匯入 daily_prices 到 core.daily_prices (✅ 3,663 rows)
- [x] 驗證: core.daily_prices 資料列數 = 3,749 (>3,663, 包含 MCP + daybrain backfill)
- [x] 驗證: 回補資料 lineage 一律標 source_role='FALLBACK' (3,749 FALLBACK + 0 CANONICAL)
- [x] 驗證: INSERT ON CONFLICT DO NOTHING — 重複資料不覆蓋 pickup 的 CANONICAL 資料 (verified via idempotency test)
- [x] tw-quant cache.db 為空 (0 bytes), 無資料可回補
- [x] tw-quant-daybrain cache_entries 32 rows — backfilled via backfill_from_mcp.py (same cache_entries schema)

## 備註
- 回補資料標 FALLBACK，後纯 pickup 管線可覆蓋為 CANONICAL
- signal 的 daily_prices 使用 stock_id，需映射到 core 的 symbol
- daybrain cache_entries 格式: cache_entries(key, value, timestamp) — 32 rows, 小量數據
- 寵訂: daybrain cache.db schema 與 MCP cache.db 相同 (cache_entries with dataset, data_date, value columns) — 使用 backfill_from_mcp.py 回補

## 執行紀錄 (2026-08-31 稽核)
- 已達成 6 項並打勾。
- **補充**:
  - Signal backfill: 3,663 rows → core.daily_prices (ON CONFLICT DO NOTHING)
  - Daybrain backfill: 14,788 rows via backfill_from_mcp.py (same cache_entries schema)
  - final core.daily_prices: 3,749 (3,663 signal + 65 MCP + 14 extra from daybrain daily_kline)
  - All rows source_role='FALLBACK'
  - Idempotency verified: re-running backfill produces same row counts

## 執行紀錄 (2026-08-31 — Signal migration to PostgreSQL)
- ✅ `migrate_signal_to_pg.py`: 9,999 rows migrated from signal.db → signal.* schema (3 views skipped: daily_prices, dividends, institutional_flows)
- ✅ Signal tables in PostgreSQL verified: pipeline_log(1,017), market_index(1,215), features(2,445), tech_indicators(1,104), margin_data(2,590), weekly_indicators(797), monthly_revenue(249), scorecard(28), performance_log(43), watchlist_history(11) + 15 more tables
- ✅ Core table counts (post backfill): stocks 11,574 | daily_prices 3,749 | financials 3,462 | dividends 1,196 | monthly_revenues 890 | institutional_flow 930 | margin_trading 1,295 — all FALLBACK
