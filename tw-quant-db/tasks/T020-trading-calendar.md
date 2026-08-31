---
id: T020
project: tw-quant-db
assignee: "pi"
priority: high
type: schema
status: done
depends_on: []
github_issue: https://github.com/gentoobreaking/ai-tasks/issues/65
created: 2026-08-31
updated: 2026-08-31
---

# T020 - core.trading_calendar Table

## 目標
新增 `core.trading_calendar` 表格到 `core/schema.sql`，支援 spec §4 的缺失日期偵測 fallback 邏輯。

## 驗收標準
- [x] `core.trading_calendar (trade_date, is_trading, day_of_week)` table created in `core/schema.sql`
- [x] Primary key on `trade_date`
- [x] Index on `is_trading`
- [x] spec §4: Trading calendar logic should come from `core.trading_calendar` if available; otherwise use weekend exclusion

## 備註
- 無交易日曆時自動 fallback 到 `EXTRACT(DOW FROM d) NOT IN (0, 6)`
