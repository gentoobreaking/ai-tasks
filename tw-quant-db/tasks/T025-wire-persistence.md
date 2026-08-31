---
id: T025
project: tw-quant-db
assignee: "pi"
priority: high
type: implementation
status: done
depends_on: [T023, T024]
github_issue: https://github.com/gentoobreaking/ai-tasks/issues/65
created: 2026-08-31
updated: 2026-08-31
---

# T025 - Wire runBackfill to Persist Fetched Data

## 目標
將 `upsertPrices` 接入 `runBackfill` 主流程，將 fetched rows 寫入 DB，dry-run 模式跳過寫入。

## 驗收標準
- [x] `runBackfill` calls `upsertPrices` after successful `fetchWithFallback`
- [x] `--dry-run` skips all DB writes (only logs)
- [x] Persisted row count tracks accurately in `BackfillReport.TotalRows`

## 備註
- spec §10: No writes to stdout during normal operation (only warnings/errors)
