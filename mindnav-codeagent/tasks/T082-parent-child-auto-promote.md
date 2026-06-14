---
github_issue: https://github.com/gentoobreaking/ai-tasks/issues/572
title: Parent→Child Auto Promote
type: Feature
priority: medium
assignee: OpenCode DeepSeek V4 Flash
status: done
created: 2026-05-18
updated: 2026-05-21
howto: 
---

  ## 實作摘要

  ### Cycle Detection（`engine/db/kanban_db.py`）
  - `_would_create_cycle(parent_id, child_id)` — 遞迴遍歷 child 的所有祖先，檢查 parent 是否已在其中
  - `link_tasks()` 改為回傳 `bool`，失敗時回傳 `False` 並 log warning
  - 拒絕 self-link
  - 成功建立 link 時自動寫入 task_events

  ### Auto-promote（`engine/db/kanban_db.py`）
  - `promote_ready_tasks()` — 查詢所有 `status='todo'` 的任務，檢查其所有 parent 是否皆為 `done`
  - 全部完成 → 更新為 `status='ready'`，寫入 task_events（kind='promoted'）
  - 回傳 promote 數量

  ### Dispatcher Worker（`engine/workers/dispatcher.py`）
  - 新檔案，獨立進程運行
  - 每 30 秒呼叫 `promote_ready_tasks()`
  - 與現有 `TaskMonitor` 模式一致

  ### API（`frontend_api/router_v1.py`）
  - 現有 `POST /api/v1/kanban/tasks/{id}/link` 加入 cycle check，失敗回傳錯誤
  - 新增 `POST /api/v1/kanban/tasks/{id}/unlink` — 解除依賴
  - 新增 `POST /api/v1/kanban/promote` — 手動觸發 promote

  ### Frontend（`TaskBoardPage.tsx`）
  - Drawer 新增 Dependencies 分頁
  - 顯示 Parents（上方）與 Children（下方），含 status badge + 移除按鈕
  - 可新增依賴：選擇 parent/child radio + 輸入 task ID + Add
  - 所有操作即時刷新清單

# T082 - Parent→Child Auto Promote

## 目標
實現任務依賴的自動升級：當一個 task 的所有 parent 都完成時，自動將其從 todo promote 到 ready 狀態。

## 驗收標準
- [x] 在 dispatcher tick 中檢查 todos
- [x] 對於每個 todo task，檢查所有 parent 是否狀態為 done
- [x] 所有 parent done → 自動將 todo → ready
- [x] 循環依賴檢查（reject 建立會造成循環的 link）
- [x] Task event 記錄 promote 事件
- [x] API：`POST /api/v1/kanban/tasks/{id}/link` 時做循環檢查
- [x] 在 task drawer UI 中顯示依賴關係圖

## 備註
- 這是 Hermes kanban 的核心功能之一
- 需要確保 atomic 操作（避免 race condition）
- 注意區分「直接 parent 全部 done」vs「所有祖先 done」
