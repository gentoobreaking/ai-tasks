---
github_issue: N/A
title: Crawl Run — metadata tracking per execution
assignee: pi with opencode
type: feat
priority: high
status: done
depends_on: []
created: 2026-09-05
updated: 2026-09-05
---

# T030 - Crawl Run — metadata tracking per execution

## 目標

追蹤每次爬蟲執行的 metadata。對應 CRAWLER_AGENT_TASKS.md §22 TASK-030, §37 Crawl Run。

## 驗收標準

- [x] `CrawlRun` struct 實現 (§37): CrawlID, StartedAt, FinishedAt, SourcesScanned, CandidatesFound, CandidatesNormalized, DuplicatesRemoved, TaiwanCandidates, Verified, Failed, Errors
- [x] `CrawlRun` 保存到 SQLite `crawl_runs` 表
- [x] `StartCrawlRun(crawlID string) *CrawlRun` 函數實現 (初始化 started_at)
- [x] `Finish()` 方法實現 (設定 finished_at, 保存 counters)
- [x] Crawl ID 格式: `YYYYMMDDTHHMMSSZ` (e.g. `20260904T120000Z`)
- [x] `RecordCandidate(count int)` 方法實現
- [x] `RecordNormalized(count int)` 方法實現
- [x] `RecordDuplicates(count int)` 方法實現
- [x] `RecordTaiwanCandidates(count int)` 方法實現
- [x] `RecordVerified(count int)` 方法實現
- [x] `RecordFailed(count int)` 方法實現
- [x] `AddError(err error)` 方法實現
- [x] Crawl run counters 驗證: discovered, normalized, duplicates 數值 non-negative, internally consistent (§TST-038)
- [x] 範例: discovered=100, normalized=90, duplicates=10 → 驗證 counters 一致 (§TST-038)
- [x] 單元測試: multi-run crawl → 存在 3 個 crawl_runs (§TST-072)
- [x] 單元測試: 第二次 crawl 0 repositories changed → discovered >= 100, changed_downloads = 0 (§TST-047)
- [x] 單元測試: repository 從 commit=A 到 commit=B → reprocessed=true, last_seen updated (§TST-048)

## 備註

- Crawl run 必須保存失敗的 errors 列表 (JSON array)
- 驗證: historical records retained, 不因 latest crawl 覆蓋 (§TST-072)

## 執行紀錄（2026-09-05 稽核）
- 已達成: 依據最終驗證 (T045) 通過 build+test+vet+mod verify, 代碼在對應 internal/ 套件中實現, 測試覆蓋率達標
