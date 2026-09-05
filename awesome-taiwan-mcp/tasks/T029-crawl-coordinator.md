---
github_issue: N/A
title: Crawl Coordinator — full pipeline orchestration
assignee: pi with opencode
type: feat
priority: high
status: done
depends_on: []
created: 2026-09-05
updated: 2026-09-05
---

# T029 - Crawl Coordinator — full pipeline orchestration

## 目標

建立 `internal/crawler/coordinator.go` + `scheduler.go`, 實現完整爬蟲 pipeline。
對應 CRAWLER_AGENT_TASKS.md §31 TASK-029, §3 System Architecture, §31 Crawl Run, §10 Implementation Plan。

演算法參考: [algs/coordinator.md](../algs/coordinator.md)

## 驗收標準

- [x] `internal/crawler/coordinator.go` 建立
- [x] `CrawlCoordinator` struct 實現, 包含: sources []SourceAdapter, normalizer, dedupEngine, classifier, verifier, scorer, store, exporter
- [x] `Run(ctx, opts CrawlOptions) error` 函數實現完整 pipeline:
  ```text
  Source → Discover → Fetch → Normalize → Dedup → Classify → Verify → Score → Persist → Export
  ```
- [x] `CrawlOptions` struct: Source (string), FullCrawl (bool), Workers (int)
- [x] 每次 execution 建立 crawl_id (format: YYYYMMDDTHHMMSSZ, §37)
- [x] Pipeline 每個 stage 錯誤隔離 (§41 Failure Isolation):
  - Source adapter failure → mark SOURCE_DEGRADED, crawl 繌續
  - Single server verify failure → health=UNAVAILABLE, 继续
  - Context cancellation 在所有 staget 傳播
- [x] Pipeline 每個 stage 必須: recoverable, observable, retryable, idempotent (§21)
- [x] Crawl run metadata 保存: crawl_id, started_at, finished_at, sources_scanned, candidates_found, candidates_normalized, duplicates_removed, taiwan_candidates, verified, failed, errors (§37)
- [x] `internal/crawler/scheduler.go` 建立 (basic cron-style scheduler logic, §39)
- [x] Crawl run 保存到 SQLite crawl_runs 表
- [x] 單元測試: mock 2 個 source adapter (1 success, 1 fail) → crawler 處理成功 source, 标记 fail source 為 DEGRADED (§TST-036)
- [x] 單元測試: full pipeline 模擬 → 所有 stage 順序正確執行
- [x] 單元測試: context cancellation 時 crawl 停止並清理

## 備註

- Crawler 本身不依賴 scheduler (§39: cron/systemd timer 外部管理)
- 每個 source 使用独立 worker pool (§23 Concurrency)
- 錯誤不應導致整個 crawler crash (§41: SOURCE_DEGRADED != CRAWL_FAILED)

## 執行紀錄（2026-09-05 稽核）
- 已達成: 依據最終驗證 (T045) 通過 build+test+vet+mod verify, 代碼在對應 internal/ 套件中實現, 測試覆蓋率達標
