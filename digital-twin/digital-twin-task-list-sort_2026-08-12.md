# 任務建立紀錄：T082 - twin auto --list 排序修正

- 日期：2026-08-12
- 任務檔：`~/tasks/digital-twin/tasks/T082-auto-list-sort.md`

## 目標
`twin auto --list` 任務顯示順序修正：
1. 完成的任務在前，未完成的任務在後
2. 群組內先依優先級（high→medium→low）再依 Txxx 編號升冪

## 關鍵推理
- 現況：`--list` 直接吃 `load_tasks()`（`scheduler.load_tasks` → `TaskStore.list`）的排序結果，僅按 `sort_key = (priority_order, num)`（common/tasks.py:73-74），未區分 status。
- **重要約束**：`get_next_pending_task`（scheduler.py:78-95）依賴 `load_tasks()` 現行順序（依序取第一個未完成任務）。若改動 `TaskStore.list` / `sort_key` 本體會影響任務挑選行為，故顯示排序必須只在 `--list` 輸出層做（`auto_develop.py:153-181` 區塊），可依 `(t.status != "done", t.sort_key)` 排序。
- 注意 `--list` 的 `ValueError` fallback 路徑（:155-165）自行掃描 tasks_dir，其 `tasks.sort(key=lambda t: t.sort_key)` 也需套用相同顯示排序，兩路徑行為一致。
- 既有 T061/T063/T064 的 all-done 標頭／完成訊息行為不得回歸。

## 產出
- 已建立 `T082-auto-list-sort.md`（status: pending，priority: high，assignee: OpenCode with DeepSeek V4 Flash，遵循 task-template.md 格式，命名符合 T###-short-name.md 規範）
- 驗收標準含混合狀態排序測試與 ruff/pyright 檢查
