---
github_issue: https://github.com/gentoobreaking/ai-tasks/issues/568
title: SQLite Kanban Schema
type: Feature
priority: high
assignee: OpenCode DeepSeek V4 Flash
status: done
created: 2026-05-18
updated: 2026-05-21
howto: 
---

  ## 實作摘要

  ### 修改檔案：`engine/db/kanban_db.py`
  保留既有方法（`register_worker`, `heartbeat_worker`, `start_task_run`, `end_task_run`, `get_stalled_tasks`, `reclaim_task`）並大幅擴充：

  ### 新增表格（`init_db()`）
  - `task_comments` — 留言（id, task_id, author, body, created）
  - `task_links` — 父子依賴（parent_id, child_id, composite PK）
  - `workspaces` — 工作區路徑（task_id, kind, path, composite PK）

  ### 新增 CRUD 方法
  - `create_task()` / `get_task()` / `update_task()` / `delete_task()` / `list_tasks()`
  - `add_event()` / `get_events()`
  - `add_comment()` / `get_comments()`
  - `link_tasks()` / `unlink_tasks()` / `get_children()` / `get_parents()`
  - `set_workspace()` / `get_workspace()`

  ### Worker Context
  - `get_worker_context(task_id)` — worker 啟動時讀取完整上下文（含 task、runs、events、comments、children、workspace）

  ### 雙軌讀取（SQLite + Markdown）
  - `_parse_markdown_task(filepath)` — 解析 markdown 任務檔案的 frontmatter
  - `sync_from_markdown(task_id, project_slug)` — 從 markdown 同步到 SQLite
  - `get_task_dual(task_id, project_slug)` — 先查 SQLite，無則從 markdown 匯入
  - `list_markdown_tasks(project_slug)` — 列出專案下的所有 markdown 任務
  - `migrate_project_to_sqlite(project_slug)` — 批次遷移整包 markdown → SQLite

# T078 - SQLite Kanban Schema

## 目標
建立 SQLite 資料庫 schema 來持久化 Kanban 任務，與現有 markdown task 檔案雙軌並行。

## 驗收標準
- [x] 建立 `engine/db/kanban_db.py`
- [x] 資料庫檔案位置：`data/kanban/kanban.db`
- [x] 表結構：
  - `tasks`（id, title, body, assignee, status, priority, tenant, workspace, idempotency_key, created, updated, result）
  - `task_events`（id, task_id, kind, actor, body, created）- append-only
  - `task_comments`（id, task_id, author, body, created）
  - `task_links`（parent_id, child_id）
  - `task_runs`（id, task_id, worker_id, status, started, ended, error）
  - `workspaces`（task_id, kind, path）
- [x] WAL mode 開啟
- [x] 實現完整 CRUD operations
- [x] 實現 `get_worker_context(task_id)` - worker 啟動時讀取的完整上下文
- [x] 雙軌讀取：同時支援 SQLite 和 markdown task
- [x] 逐步將寫入移轉到 SQLite（最終完全移除 markdown dependency）

## 備註
- 這是 T090 的基礎
- 注意與現有 `data/projects/*/tasks/` 的 markdown 並存
- schema 設計借鑒 Hermes 的 `kanban.db`
