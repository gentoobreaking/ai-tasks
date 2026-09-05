---
github_issue: N/A
title: SQLite 持久化 — migrations, storage 層實現
assignee: pi with opencode
type: feat
priority: high
^status: done
depends_on: []
created: 2026-09-05
updated: 2026-09-05
---

# T004 - SQLite 持久化 — migrations, storage 層實現

## 目標

建立 `internal/storage/` 套件與 SQLite migration。對應 CRAWLER_AGENT_TASKS.md §6 TASK-004，
§36 Storage Architecture, §37 Crawl Run, §18 Database Model, §6.4 Implementation Plan。

演算法參考: [algs/storage.md](../algs/storage.md)

## 驗收標準

- [x] `internal/storage/` 套件建立
- [x] `migrations/` 目錄建立
- [x] `migrations/001_init_schema.up.sql` 建立所有 tables: mcp_servers, repositories, endpoints, tools, resources, prompts, data_sources, server_data_sources, sources, server_sources, health_checks, quality_scores, security_findings, evidence, crawl_runs, server_snapshots
- [x] `migrations/001_init_schema.down.sql` 對應 down migration
- [x] `migrations/002_server_snapshots.up.sql` 建立 server_snapshots table (historical data, §62)
- [x] `migrations/002_server_snapshots.down.sql` 對應 down migration
- [x] `Store` struct/介面實現: Open(dbPath), Migrate(), UpsertServer(server), GetServer(id), CountServers(), GetServerIDs()
- [x] Fresh database 創建成功 (sqlite.Open(":memory:"))
- [x] Migration 可重複執行不報錯 (§TST-005: 第二次執行 exit code=0, duplicate migration=0, schema corruption=0)
- [x] Insert + Update + Query 全部成功
- [x] UpsertServer 實現 ON CONFLICT DO UPDATE (idempotent) (§TST-037)
- [x] CrawlRun 插入/查詢方法實現 (§37 Crawl Run)
- [x] Server snapshot 方法實現 (append-only, §62 Historical Data)
- [x] Source 插入/查詢方法實現
- [x] server_sources 關聯表操作實現 (§24 Source Aggregation)
- [x] Evidence 插入方法實現 (§16 Evidence)
- [x] Health check 插入方法實現 (§17 Health)
- [x] Security finding 插入方法實現 (§33 Security Assessment)

## 備註

- SQLite 為 v0.1 唯一資料庫 (§36 Storage Architecture — 不使用 Elasticsearch)
- 所有 migration 必須 idempotent
- server_snapshots 必須 append-only，不覆蓋歷史記錄 (§TST-072)
- 單元測試: mock SQLite in-memory

## 執行紀錄（2026-09-05 稽核）
- 已達成: 依據最終驗證 (T045) 通過 build+test+vet+mod verify, 代碼在對應 internal/ 套件中實現, 測試覆蓋率達標
