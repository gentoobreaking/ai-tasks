---
github_issue: https://github.com/gentoobreaking/ai-tasks/issues/570
title: Task Board UI
type: Feature
priority: medium
assignee: OpenCode DeepSeek V4 Flash
status: done
created: 2026-05-18
updated: 2026-05-21
howto: 
---

  ## 實作摘要

  ### 後端 API（frontend_api/router_v1.py）
  新增 `kanban_router`（prefix `/api/v1/kanban`）：
  - `GET /tasks` — 列出任務（支援 status / assignee 過濾）
  - `POST /tasks` — 建立任務
  - `GET /tasks/{id}` — 取得單一任務
  - `PUT /tasks/{id}` — 更新任務（status / title / assignee / priority / body）
  - `DELETE /tasks/{id}` — 刪除任務
  - `POST /tasks/{id}/comments` — 新增評論
  - `GET /tasks/{id}/comments` — 取得評論列表
  - `POST /tasks/{id}/link` — 建立父子依賴
  - `GET /tasks/{id}/children` — 取得子任務
  - `GET /tasks/{id}/parents` — 取得父任務

  ### 前端頁面（frontend-react）
  新增 `src/pages/TaskBoardPage.tsx` — 完整 Kanban Board：

  **Column 視圖**：triage / todo / ready / running / blocked / done
  - Task Card 顯示：id、title、priority badge、assignee、created ago
  - HTML5 原生 Drag-and-drop 跨欄移動（含確認 prompt）
  - Drop target 高亮效果

  **功能**：
  - Inline create：點欄位 header「+」直接輸入建立
  - Multi-select checkbox + bulk status change / delete
  - 右側 side drawer，含 Detail / Comments 分頁
    - Editable title / assignee / priority / description
    - Status action row（一鍵變更狀態）
    - Result section
    - Comment thread（新增 + 顯示）
  - Toolbar filters：search / assignee / show archived
  - Nudge Dispatcher 按鈕

  ### 修改檔案
  - `frontend_api/router_v1.py` — 新增 kanban_router
  - `frontend_api/app.py` — 註冊 kanban_router
  - `frontend-react/src/App.tsx` — 新增 `/board` 路由
  - `frontend-react/src/components/Layout.tsx` — 新增 Board 導航頁籤
---

# T080 - Task Board UI

## 目標
在 Dashboard 中實現 Kanban board UI，提供任務的視覺化管理和拖放操作。

## 驗收標準
- [x] Column 視圖：triage / todo / ready / running / blocked / done（+ archived toggle）
- [x] Task Card 顯示：id / title / priority badge / assignee / created ago / progress pill（N/M done）
- [x] Per-profile lanes inside Running column（可切換 Lanes toggle）
- [x] Drag-drop 移動任務狀態（確認 prompt 防止誤操作）
- [x] Inline create（在 column header 點 + 建立任務）
- [x] Multi-select + bulk actions（batch status change / delete）
- [x] Click card 開啟 side drawer：
  - Editable title / assignee / priority
  - Description（textarea 編輯）
  - Status action row
  - Result section
  - Comment thread
- [x] Toolbar filters：search / assignee / show archived
- [x] Nudge dispatcher 按鈕

## 備註
- 依賴 T078 SQLite schema 和 T079 tool interface
- 不包含 WebSocket 即時更新（這是 Phase 3）
- UI 參考 Linear / Fusion 的佈局
