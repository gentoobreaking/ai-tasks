---
github_issue: null
title: common/tasks.py 任務存取層（消除 auto_develop 與 agent_registry 重複解析）
type: refactor
priority: high
status: done
spec_version: v3
commit: a1c28f0
depends_on: []
assignee: OpenCode with DeepSeek V4 Flash
created: '2026-08-09'
updated: '2026-08-10'
commit: a20b56b
---
# T036 - 任務存取層統一（TaskStore）

## 目標
設計審查（docs/design-review.md §二.1）發現任務檔解析在 `auto_develop.py`（parse_task_file/load_tasks/update_task_status/sync_readme）與
`agent_registry.py`（extract_tags/find_task_file）重複兩套。建立 `common/tasks.py` 單一存取層，
消除 frontmatter 常識複寫，並保留兩側既有行為（改動後全量測試須維持 124 passed + 1 skipped）。

## 驗收標準
- [x] 新增 `common/tasks.py`：`TaskStore` 提供
  - list/project 掃描（含 depends_on 解析、priority/sort_key、is_pending/is_done）
  - find(task_id, project)（取代 agent_registry.find_task_file）
  - set_status / save_summary（frontmatter 重寫，行為等同 auto_develop.update_task_status）
- [x] `agent_registry.py` 改用 TaskStore（extract_tags 邏輯保留在 agent_registry 或遷入 store，可引用）
- [x] `auto_develop.py` 改用 TaskStore（parse_task_file/load_tasks/task_dependencies 改成薄 wrapper 或遷移）
- [x] 兩側行為不變：`twin route --task-id`、`twin auto --list`、`twin blocked` 輸出與先前一致
- [x] `pytest tests/` 全量 124 passed + 1 skipped；`ruff check` 全過
- [x] 不引入新依賴（stdlib + 既有 yaml 即可）

## 備註
- 只做「存取層統一」，不做 auto_develop 職責拆分（拆分為另一任務）
- 注意保留 `Task.content`（body 不含 frontmatter）的既有語意，避免 update 時 YAML 重排破壞
- T034 後 extract_tags 只掃 frontmatter 外部文；遷移時不得改變該行為