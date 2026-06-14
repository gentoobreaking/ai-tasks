---
github_issue: https://github.com/openclawchen8-lgtm/openclaw-tasks/issues/566
title: Worker Output Channel
type: Feature
priority: high
status: done
assignee: OpenCode DeepSeek V4 Flash
created: 2026-05-18
updated: 2026-05-21
howto: 
---

  ## 實作摘要

  ### 新增檔案
  - `engine/channels/__init__.py` — channels package
  - `engine/channels/worker_output.py` — `WorkerOutputChannel` class，含 `publish()` / `subscribe()`

  ### 修改檔案
  - `engine/nodes/base.py` — 新增 `wrap_node_fn(node_func, channel)` 包裝 node function 捕獲輸出
  - `engine/skills/task_executor.py` — `task_executor_node` 在 start/complete/error 自動 publish；`execute_task_simple` 使用 `wrap_node_fn`

  ### 設計要點
  - JSON 格式：`{task_id, node, output, timestamp}`
  - 每條輸出截斷 500 chars
  - Redis 不可用時優雅降級（log warning + 靜默跳過）
  - Singleton `get_channel()` 供各處共用

# T076 - Worker Output Channel

## 目標
建立統一的 worker 輸出匯集管道，透過 Redis pubsub 收集所有 worker node 的輸出，供即時監控使用。

## 驗收標準
- [x] 建立 `engine/channels/worker_output.py`
- [x] `WorkerOutputChannel` class：
  - `publish(task_id, node, output)` - 發布輸出到 channel
  - `subscribe()` - 訂閱 channel
- [x] 用 json 格式化輸出：
  ```json
  {"task_id": "...", "node": "...", "output": "...", "timestamp": 1234567890}
  ```
- [x] 包裝 `task_executor_node`，在 start/end 自動 publish
- [x] 包裝 `wrapped_node_fn`，捕獲並轉發輸出
- [x] 支援多 worker 並行輸出
- [x] 輸出截斷（每條最多 500 chars）防止訊息爆炸

## 備註
- 底層使用 Redis pubsub，須確保 redis 可用
- 如果 redis 不可用，應 graceful degradation
- 這是 T088 的基礎
