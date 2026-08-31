---
id: T034
project: tw-quant-db
assignee: "pi"
priority: high
type: testing
status: done
depends_on: [T025, T030]
github_issue: https://github.com/gentoobreaking/ai-tasks/issues/65
created: 2026-08-31
updated: 2026-08-31
---

# T034 - Integration Test

## 目標
end-to-end 測試: single-symbol backfill 到 PostgreSQL。

## 驗收標準
- [x] `backfill/core_test.go`: tests `getMissingDates`, `upsertPrices`, `runBackfill` with mock Source
- [x] Dry-run mode produces report without DB writes
- [x] Idempotency: re-run produces same row counts (no duplicates via ON CONFLICT)
- [x] Uses `TW_QUANT_DB_PATH` (sqlite fallback for dev) as spec §10 mentions

## 備註
- spec §10 Acceptance Criteria: idempotent re-runs, rate limiting, sqlite fallback
- Test uses a stub Source that returns deterministic data
