---
github_issue: N/A
title: Crawl Run — metadata tracking per execution
type: feat
priority: high
status: pending
depends_on: [T027]
assignee: agent
created: 2026-09-05
updated: 2026-09-05
---

# T030 - Crawl Run — metadata tracking per execution

## 目標

追蹤每次爬蟲執行的 metadata。對應 CRAWLER_AGENT_TASKS.md §22 TASK-030, §37 Crawl Run。

## 驗收標準

- [ ] `CrawlRun` struct 實現 (§37): CrawlID, StartedAt, FinishedAt, SourcesScanned, CandidatesFound, CandidatesNormalized, DuplicatesRemoved, TaiwanCandidates, Verified, Failed, Errors
- [ ] `CrawlRun` 保存到 SQLite `crawl_runs` 表
- [ ] `StartCrawlRun(crawlID string) *CrawlRun` 函數實現 (初始化 started_at)
- [ ] `Finish()` 方法實現 (設定 finished_at, 保存 counters)
- [ ] Crawl ID 格式: `YYYYMMDDTHHMMSSZ` (e.g. `20260904T120000Z`)
- [ ] `RecordCandidate(count int)` 方法實現
- [ ] `RecordNormalized(count int)` 方法實現
- [ ] `RecordDuplicates(count int)` 方法實現
- [ ] `RecordTaiwanCandidates(count int)` 方法實現
- [ ] `RecordVerified(count int)` 方法實現
- [ ] `RecordFailed(count int)` 方法實現
- [ ] `AddError(err error)` 方法實現
- [ ] Crawl run counters 驗證: discovered, normalized, duplicates 數值 non-negative, internally consistent (§TST-038)
- [ ] 範例: discovered=100, normalized=90, duplicates=10 → 驗證 counters 一致 (§TST-038)
- [ ] 單元測試: multi-run crawl → 存在 3 個 crawl_runs (§TST-072)
- [ ] 單元測試: 第二次 crawl 0 repositories changed → discovered >= 100, changed_downloads = 0 (§TST-047)
- [ ] 單元測試: repository 從 commit=A 到 commit=B → reprocessed=true, last_seen updated (§TST-048)

## 備註

- Crawl run 必須保存失敗的 errors 列表 (JSON array)
- 驗證: historical records retained, 不因 latest crawl 覆蓋 (§TST-072)
