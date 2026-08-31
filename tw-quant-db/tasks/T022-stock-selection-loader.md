---
id: T022
project: tw-quant-db
assignee: "pi"
priority: high
type: implementation
status: done
depends_on: []
github_issue: https://github.com/gentoobreaking/ai-tasks/issues/65
created: 2026-08-31
updated: 2026-08-31
---

# T022 - Stock Selection Loader

## 目標
實作 spec §3 的股票選擇邏輯，支援 env var 和 CLI flag。

## 驗收標準
- [x] Go function `loadStockList(ctx, db, opts)` in `backfill/db.go`
- [x] Priority order: `STOCK_IDS` → `STOCKS_FILE` → `BACKFILL_ALL_LISTED` → default `["2330", "0050", "2317"]`
- [x] `STOCKS_FILE`: one stock_id per line, skip comments
- [x] `BACKFILL_ALL_LISTED=true`: query `core.stocks WHERE active = TRUE`
- [x] CLI `--stock-ids` overrides env var

## 備註
- spec §3 明確: BACKFILL_ALL_LISTED 跳過若 STOCK_IDS 或 STOCKS_FILE 已設定
