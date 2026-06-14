---
github_issue: https://github.com/gentoobreaking/ai-tasks/issues/573
title: Failed Task + Crash Recovery
type: Feature
priority: high
status: done
assignee: Gemini gemini-3-flash-preview & OpenCode DeepSeek V4 Flash
created: 2026-05-18
updated: 2026-05-20
howto: 
---
  1. 實作 engine/db/kanban_db.py 提供任務執行追蹤與 Worker 心跳管理。
  2. 強化 engine/workers/coder_worker.py 整合 KanbanDB，支援啟動註冊、心跳回報與任務狀態標記 (Started/Completed/Failed)。
  3. 建立 engine/workers/monitor.py 監控服務，自動偵測心跳逾時或超時任務，並執行回收 (Running -> Ready) 邏輯。
  4. 在 docker-compose.yml 部署 task-monitor 服務實現 24/7 自動恢復。

# T083 - Failed Task + Crash Recovery

## 目標
實現任務失敗的自動處理和 worker crash 後的恢復機制。

## 已完成功能
- [x] **連續失敗追蹤**：透過 `tasks.failure_count` 追蹤，超過 3 次自動設為 `blocked`。
- [x] **Worker 註冊與心跳**：Worker 啟動時記錄 PID 與 Hostname，每 30 秒更新一次心跳。
- [x] **任務自動回收**：`TaskMonitor` 每 60 秒檢查一次，發現心跳逾時 (120s) 的任務自動從 `running → ready` 供重新派發。
- [x] **執行超時處理**：支援 `max_runtime` (TTL)，超時任務自動回收。
- [x] **事件記錄**：`task_runs` 表紀錄每一次嘗試的狀態與錯誤訊息。

## 驗收標準
- [x] 追蹤每個 task 的連續失敗次數
- [x] 達到失敗閾值 → 自動 block task，並記錄 last error
- [x] Worker PID 監控（註冊在 workers 表）
- [x] 自動 reclaim：`running → ready`（由 TaskMonitor 執行）
- [x] Task event 記錄：started / completed / failed / heartbeat_timeout
- [x] `max_runtime` 支援：預設 3600s
- [x] TTL 到期後自動標記為 timeout
- [x] UI：Task card 顯示 failed/crashed badge（實作於 PendingTasksPage — 依失敗次數顯示 FAILED×N 或 CRASHED 徽章）
- [x] UI：Task drawer 顯示 attempt history（task_runs 表，實作於 PendingTasksPage side drawer，含 status/worker/started/ended/duration/error）

## 備註
- 這是 Phase 3 最高風險的項目
- 需要與 dispatcher 緊密配合
- Hermes 的 circuit breaker 模式可參考
