---
id: T021
project: tw-quant-db
assignee: "pi"
priority: high
type: implementation
status: done
depends_on: [T020]
github_issue: https://github.com/gentoobreaking/ai-tasks/issues/65
created: 2026-08-31
updated: 2026-08-31
---

# T021 - Missing Date Detection Query

## 目標
實作 spec §4 的缺失日期偵測：對每個股票，在 `[start_date, end_date]` 範圍內找出 `core.daily_prices` 中不存在的交易日。

## 驗收標準
- [x] Go function `getMissingDates(ctx, db, symbol, start, end)` in `backfill/db.go`
- [x] Uses recursive CTE from spec §4 with `core.trading_calendar` (preferred) OR weekend exclusion fallback
- [x] Returns `[]time.Time` of missing dates per stock
- [x] Respects trading calendar `is_trading` flag when `core.trading_calendar` is populated

## 備註
- T020 新增 `core.trading_calendar` table 後，缺失偵測查詢優先從交易日曆判斷
- 若交易日曆為空，fallback to `EXTRACT(DOW FROM ds.d) NOT IN (0, 6)`
