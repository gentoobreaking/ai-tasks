---
github_issue: ""
title: Snapshot Model Implementation
type: task
priority: high
status: done
depends_on: ["T002"]
assignee: pi
created: 2026-09-03
updated: 2026-09-03
---

# T003 - Snapshot Model Implementation

## 目標
實作 dataset_snapshot 核心模型與 snapshot locking 機制，確保 immutable snapshot 特性。

## 驗收標準
- [x] 實作 dataset_snapshot domain model (id, source, source_version, downloaded_at, published_at, file_name, file_sha256, record_count, status, schema_version, import_started_at, import_completed_at)
- [x] 實作 SnapshotRepository (CRUD + Lock 操作)
- [x] Snapshot 一旦 LOCKED：UPDATE prohibited, DELETE prohibited
- [x] 實作 snapshot 狀態機 (PENDING → IMPORTING → LOCKED / FAILED)
- [x] 單元測試覆蓋 snapshot lifecycle
- [x] 整合測試驗證 lock 機制

## 備註
- 遵循 P2 Raw Data Immutable 原則
- Snapshot 一旦建立不得由一般 AI workflow 修改
- Provenance 追溯鏈：Transaction → Snapshot → Official Source
