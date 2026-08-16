---
github_issue: null
title: twin auto --list 顯示專案皆完成訊息
type: feature
priority: medium
status: done
spec_version: v3
commit: a1c28f0
depends_on: []
assignee: OpenCode with DeepSeek V4 Flash
created: '2026-08-11'
updated: '2026-08-11'
---
# T061 - twin auto --project <all-done> --list 顯示友善完成訊息

## 目標
`twin auto --project tw-quant-daybrain --list` 當所有 task 皆為 `done` 時，
目前因 `discover_projects()` 跳過無 active task 的專案，導致 `ValueError: Unknown project`。
應改為：若 project 存在但任務皆完成，顯示友善訊息而非直接錯誤。

## 驗收標準
- [x] `./twin auto --project tw-quant-daybrain --list` 不再報 `ValueError: Unknown project`
- [x] 顯示訊息為：「該專案 tw-quant-daybrain 中的任務目前皆已完成！」
- [x] 顯示已完成任務的清單（帶 ✅ 標記）
- [x] digital-twin 等有 active task 的專案不受影響，仍正常列出 pending/in-progress 任務
- [x] pytest 126 passed + 2 skipped；ruff auto_develop.py 通過

## 備註
- `discover_projects()` 只包含有 ≥1 非 done 任務的 project，導致 tw-quant-daybrain 被排除
- `TaskStore._project_paths()` → `scheduler.py:62 _task_store().list()` → `ValueError`
- 解法選項：
  1. `load_tasks()` / `TaskStore.list()` 攔截 `Unknown project` 錯誤，改為查詢 tasks 目錄是否存在
  2. `discover_projects()` 改為不論 task 狀態都收納 project，但標記已完成
  3. `auto_develop.py` --list 區段在 `load_tasks()` 擲錯前，先嘗試直接掃描對應 tasks 目錄
- 建議方案 1 或 3：當 `PROJECT_PATHS` 查找失敗時，直接嘗試掃描 `~/tasks/<project>/tasks/T*.md`
