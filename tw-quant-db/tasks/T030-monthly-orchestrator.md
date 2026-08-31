---
id: T030
project: tw-quant-db
assignee: "pi"
priority: high
type: implementation
status: done
depends_on: [T025, T026, T027, T029]
github_issue: https://github.com/gentoobreaking/ai-tasks/issues/65
created: 2026-08-31
updated: 2026-08-31
---

# T030 - Monthly Backfill Orchestrator

## 目標
實作 spec §12 的 Monthly Backfill Orchestrator: 由近至遠月份批次回補。

## 驗收標準
- [x] `generateMonthlyIntervals(start, end)` generates 61 months for `--range 5Y`
- [x] Each month split into 5-day sub-batches (spec §6 Max batch size)
- [x] Concurrency limiter: semaphore channel limits concurrent fetches (spec §12 performance 1500 stocks × 61 months)
- [x] Uses goroutines + sync.WaitGroup for concurrent fetch+upsert
- [x] Monthly progress logged (spec §10: no writes to stdout during normal operation)

## 備註
- spec §12: 1500 檔股票 × 61 月 = 91,500 次請求
- spec §12: 總時間 2-4 天 (依上游速率限制)
- concurrency limiter: MAX_CONCURRENT (spec §13 RunMonthlyBackfill)
