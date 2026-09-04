---
github_issue: N/A
title: > ⛔ Historical Snapshots — crawl run history + time-series data (Phase 2)
type: feat
priority: low
status: deferred
depends_on: [T030, T027]
blocked_on:
- "Phase 1 complete (all T001–T046 tasks done)"
assignee: agent
created: 2026-09-05
updated: 2026-09-05
---

# T047 - > ⛔ Historical Snapshots — crawl run history + time-series data (Phase 2)

## 目標

實現 historical data retention: multi-run crawl history, time-series tracking。
對應 CRAWLER_AGENT_TASKS.md §47 TASK-047, §62 Historical Data, §37 Crawl Run。

> ⛔ 本任務受外部條件約束：blocked_on 全數滿足前不得開工。

## 驗收標準

- [ ] `crawl_runs` 表保存每次 crawl metadata (T030)
- [ ] `server_snapshots` 表保存 append-only historical data (§62)
- [ ] 每次 crawl 對每個 server 產生 snapshot: snapshot_id, server_id, crawl_id, name, level, quality_score, health_status, tool_count, transport, timestamp
- [ ] 多次 crawl → multiple snapshots per server (時間序列)
- [ ] `crawler stats --history` 命令顯示 crawl run history (日期, sources scanned, candidates, unique MCP count)
- [ ] 單位測試: 3 個多 crawl → 3 個 crawl_runs records
- [ ] 單位測試: 每個 server 至少 1 snapshot per crawl
- [ ] 單位測試: historical records not overwritten by latest crawl (§TST-072)

## 備註

- v0.1 不包含 (§67 MVP Scope: Phase 2+)
- Historical snapshots 儲存於 `server_snapshots` table (append-only)
- 保留至少 30 天 crawl history
