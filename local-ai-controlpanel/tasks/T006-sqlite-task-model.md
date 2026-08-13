---
github_issue: N/A
title: SQLite schema + Task model + Task Manager（Phase 1）
type: feature
priority: high
status: pending
depends_on: [T005]
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-13
updated: 2026-08-13
---

# T006 - SQLite schema + Task model + Task Manager

## 目標

依 spec §27 SQLite Schema（含 FTS5）與 §8 Core Domain Model：實作 `tasks`、`evidence`、`verification_results`、`escalations` 表，並依同樣慣例建 `attempts / evidence_sources / policies / worker_runs / patches / reflections / project_memory / clouds_usage / hallucination_evidence` 表；Task & RepositoryContext 型別；Task Manager（CRUD + 任務記錄查詢）。

## 驗收標準

- [ ] §27 四張核心表 + 其餘表（依 `id / task_id / ... / created_at` 慣例）建立
- [ ] `tasks` 狀態欄位與 §9 state machine 相容（含 attempt、sandbox_mode）
- [ ] Task Manager：create / get / list / updateStatus / 關聯 attempt 與 worker_runs
- [ ] migration 可重複執行（開機自動 migrate）
- [ ] `tests/unit`：schema CRUD + 過濾查詢測試通過

## 備註

- 儲存選擇：SQLite（+ FTS5），MVP 不上 Vector DB（§6 決策紀錄）。
- SQLite driver：優先評估 Node 22 內建 `node:sqlite`；若功能不足（如 FTS5 或 migration 工具）改用 better-sqlite3（需本機 build 工具）。
- `sandbox_mode` 欄位為 v0.5 新增（§8），表 schema 需含入。