---
id: T024
project: tw-quant-db
assignee: "pi"
priority: high
type: implementation
status: done
depends_on: [T023]
github_issue: https://github.com/gentoobreaking/ai-tasks/issues/65
created: 2026-08-31
updated: 2026-08-31
---

# T024 - Upsert Prices to core.daily_prices

## 目標
實作 spec §7 的 UPSERT logic: `INSERT ... ON CONFLICT DO UPDATE` 到 `core.daily_prices`，確保 idempotency。

## 驗收標準
- [x] Go function `upsertPrices(ctx, db, symbol, rows)` in `backfill/db.go`
- [x] INSERT with all 13 columns: symbol, trade_date, open, high, low, close, volume, adjusted_close, source, data_date, freshness, source_role
- [x] `source='backfill_go'`, `source_role='FALLBACK'`, `freshness='FALLBACK'`
- [x] ON CONFLICT (symbol, trade_date) DO UPDATE SET on all price columns
- [x] Batch size 200 for efficiency

## 備註
- core schema 使用 `adjusted_close` (not `adj_close`), `symbol` (not `stock_id`)
- spec §7 upsert logic 與 T009/T017 Python backfill 相同 pattern
