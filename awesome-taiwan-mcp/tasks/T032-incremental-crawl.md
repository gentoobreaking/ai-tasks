---
github_issue: N/A
title: Incremental Crawl — ETag, pushed_at, last_seen tracking
type: feat
priority: high
status: pending
depends_on: [T004, T027]
assignee: agent
created: 2026-09-05
updated: 2026-09-05
---

# T032 - Incremental Crawl — ETag, pushed_at, last_seen tracking

## 目標

實現增量爬蟲, 避免重複下載未變更內容。
對應 CRAWLER_AGENT_TASKS.md §24 TASK-032, §38 Incremental Crawl, §14 Implementation Plan。

## 驗收標準

- [ ] `IncrementalCrawler` struct 實現: `CheckForUpdates(ctx, server MCPServer) (bool, error)`
- [ ] 保存 tracking fields (§38):
  - `last_seen` — server 上次被 crawler 發現時間
  - `last_updated` — GitHub updated_at
  - `last_verified` — 上次驗證時間
  - `etag` — HTTP ETag header值
  - `last_modified` — HTTP Last-Modified header值
  - `pushed_at` — GitHub push timestamp
- [ ] GitHub adapter 使用 `pushed_at` 比較: 如果 candidate pushed_at <= last_seen → 跳過 fetch
- [ ] HTTP sources 使用 ETag / Last-Modified: 如果 server 返回 304 Not Modified → 跳過 body 下載
- [ ] `isChanged(server MCPServer, candidate RawCandidate) bool` 函數實現
- [ ] Unchanged repositories: not reprocessed (§TST-048)
- [ ] Changed repositories: reprocessed=true, last_seen updated, last_verified updated (§TST-048)
- [ ] Deleted repositories (404): status=DELETED, historical record retained (§TST-049)
- [ ] Incremental crawl 模式: `crawler crawl --source github` (without --full) 使用增量
- [ ] Full crawl 模式: `crawler crawl --full` 強制爬所有
- [ ] 單元測試: 第二次 crawl, 0 repositories changed → discovered >= 100, changed_downloads = 0 (§TST-047)
- [ ] 單元測試: ETag 匹配 → HTTP body downloads = 0
- [ ] 單元測試: repository 404 → status=DELETED, historical record retained (§TST-049)

## 備註

- Daily crawl: 只更新變動 repository (§38)
- Weekly: Full crawl (§38, §39 Scheduler)
- ETag/Last-Modified 在 GitHub adapter 中實現
- 刪除的 repository 不得直接 delete database record (§TST-049)
