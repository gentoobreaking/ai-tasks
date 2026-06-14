---
github_issue: https://github.com/openclawchen8-lgtm/openclaw-tasks/issues/571
title: Task Log File Tailing
type: Feature
priority: low
assignee: OpenCode DeepSeek V4 Flash
status: done
created: 2026-05-18
updated: 2026-05-21
howto: null
---

# T081 - Task Log File Tailing

## 目標
為每個 Kanban task 建立獨立的 log 檔案，支援 API 和 UI 的 tail 查詢。

## 驗收標準
- [x] Log 檔案位置：`data/kanban/logs/<task_id>.log`
- [x] 在 task 開始時建立 log 檔案
- [x] 記錄所有 node 輸出到 log 檔案
- [x] 記錄 heartbeat notes（透過 `wrap_node_fn` 自動擷取）
- [x] 記錄 task 完成/失敗的 summary
- [x] API endpoint：`GET /api/v1/kanban/tasks/{task_id}/log`（支援 `?tail=N` 取最後 N 行）
- [x] API endpoint：`GET /api/v1/kanban/tasks/{task_id}/log/stream`（SSE streaming）
- [x] UI：Task drawer 中的 Log 分頁，支援 tail -f（自動 scroll + header badge 顯示條數）

## 備註
- 利用現有的 logging 機制
- Log 檔案應在 task archive 後仍可訪問
- 考慮 log rotation 防止單一檔案過大

## T081 完成。以下是交付摘要：

**新增文件**
- `engine/db/task_logger.py` — NDJSON per-task log 檔案系統，提供 `write()`、`read_tail()`、`stream()`（SSE generator）

**修改文件**

| 檔案 | 變更 |
|------|------|
| `engine/skills/task_executor.py` | `task_executor_node` 和 `execute_task_simple` 加入 start/node_output/complete/error log 寫入 |
| `engine/nodes/base.py` | `wrap_node_fn` 中每個 node 輸出後自動寫入 log |
| `frontend_api/router_v1.py` | 新增 2 個 endpoint：`GET .../log?tail=N` + `GET .../log/stream`（SSE，token via query param） |
| `frontend-react/.../TaskBoardPage.tsx` | Drawer 新增 Log 分頁：自動載入 200 條歷史、SSE 即時串流 + 自動 scroll、ERROR 紅底標示、live indicator |

**Log 格式** (`data/kanban/logs/<task_id>.log`)
```jsonl
{"timestamp":"2026-05-21T12:00:00Z","level":"INFO","type":"start","message":"Starting: ...","worker":"coder"}
{"timestamp":"2026-05-21T12:00:05Z","level":"INFO","type":"node_output","message":"Node coder produced output","node":"coder","output_preview":"..."}
{"timestamp":"2026-05-21T12:00:10Z","level":"INFO","type":"complete","message":"Task completed"}
{"timestamp":"2026-05-21T12:00:10Z","level":"ERROR","type":"error","message":"Task failed: ..."}
```

