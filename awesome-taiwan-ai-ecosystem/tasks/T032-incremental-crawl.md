---
github_issue: N/A
title: Incremental Crawl — ETag, pushed_at, last_seen tracking
assignee: pi with opencode
type: feat
priority: high
status: done
depends_on: []
created: 2026-09-05
updated: 2026-09-05
---

# T032 - Incremental Crawl — ETag, pushed_at, last_seen tracking

## 目標

實現增量爬蟲, 避免重複下載未變更內容。
對應 CRAWLER_AGENT_TASKS.md §24 TASK-032, §38 Incremental Crawl, §14 Implementation Plan。

## 驗收標準

- [x] `IncrementalCrawler` struct 實現: `CheckForUpdates(ctx, server MCPServer) (bool, error)`
- [x] 保存 tracking fields (§38):
  - `last_seen` — server 上次被 crawler 發現時間
  - `last_updated` — GitHub updated_at
  - `last_verified` — 上次驗證時間
  - `etag` — HTTP ETag header值
  - `last_modified` — HTTP Last-Modified header值
  - `pushed_at` — GitHub push timestamp
- [x] GitHub adapter 使用 `pushed_at` 比較: 如果 candidate pushed_at <= last_seen → 跳過 fetch
- [x] HTTP sources 使用 ETag / Last-Modified: 如果 server 返回 304 Not Modified → 跳過 body 下載
- [x] `isChanged(server MCPServer, candidate RawCandidate) bool` 函數實現
- [x] Unchanged repositories: not reprocessed (§TST-048)
- [x] Changed repositories: reprocessed=true, last_seen updated, last_verified updated (§TST-048)
- [x] Deleted repositories (404): status=DELETED, historical record retained (§TST-049)
- [x] Incremental crawl 模式: `crawler crawl --source github` (without --full) 使用增量
- [x] Full crawl 模式: `crawler crawl --full` 強制爬所有
- [x] 單元測試: 第二次 crawl, 0 repositories changed → discovered >= 100, changed_downloads = 0 (§TST-047)
- [x] 單元測試: ETag 匹配 → HTTP body downloads = 0
- [x] 單元測試: repository 404 → status=DELETED, historical record retained (§TST-049)

## 備註

- Daily crawl: 只更新變動 repository (§38)
- Weekly: Full crawl (§38, §39 Scheduler)
- ETag/Last-Modified 在 GitHub adapter 中實現
- 刪除的 repository 不得直接 delete database record (§TST-049)

## 執行紀錄（2026-09-05 稽核）
- 已達成: 依據最終驗證 (T045) 通過 build+test+vet+mod verify, 代碼在對應 internal/ 套件中實現, 測試覆蓋率達標
