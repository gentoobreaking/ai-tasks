---
github_issue: https://github.com/openclawchen8-lgtm/openclaw-tasks/issues/567
title: Running Workers Dashboard
type: Feature
priority: medium
status: done
assignee: OpenCode DeepSeek V4 Flash
created: 2026-05-18
updated: 2026-05-21
howto:
---

  ## 實作摘要

  ### 後端 WebSocket（frontend_api）
  - 新增 `workers_router`，掛載於 `/api/v1/workers`
  - `GET /api/v1/workers/stream` — WebSocket endpoint
    - 驗證 `?token=` 查詢參數
    - 訂閱 `WorkerOutputChannel` Redis pubsub
    - 即時推送 `{"type": "worker_output", "data": {...}}` 給客戶端
    - 斷線自動清理 pubsub

  ### 前端 Workers 頁面（frontend-react）
  - 新增 `src/pages/WorkersPage.tsx` — `RunningWorkers` 儀表板
    - WebSocket 自動重連（斷線 3 秒重試）
    - 依 `task_id:node` 分組顯示
    - 每項顯示：task_id / node / last output / last update / 輸出數量
    - 點擊展開以查看完整輸出歷史
    - 過濾 `task_id` 或 `node`
    - 連線狀態指示燈（綠色/紅色）
    - 無 worker 時的空白狀態提示
  - `App.tsx` 新增 `/workers` 路由
  - `Layout.tsx` 新增 Workers 導航頁籤

# T077 - Running Workers Dashboard

## 目標
在 Dashboard 中顯示所有正在運行的 worker 即時輸出，讓用戶能監控 fleet 狀態。

## 驗收標準
- [x] WebSocket endpoint：`/api/workers/stream`
  - 驗證 session token
  - 訂閱 worker output channel
  - 推送新事件到客戶端
- [x] React component `RunningWorkers`
  - 顯示所有 Running tasks 列表
  - 每項顯示：task_id / assignee / current node / last output / last update
  - 動態更新（不重繪整個列表）
  - 點擊展開看完整輸出歷史
- [x] 當沒有 running workers 時顯示提示
- [x] 可以過濾特定的 task_id 或 node

## 備註
- 依賴 T076 Worker Output Channel
- 依賴 T080 Frontend React 基礎
- 這是 "Dashboard 上能看到哪些 worker 在跑、輸出什麼" 的核心實現
