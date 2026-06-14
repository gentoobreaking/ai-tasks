---
github_issue: https://github.com/gentoobreaking/ai-tasks/issues/603
type: Feature
priority: high
status: done
assignee: OpenCode DeepSeek V4 Flash
created: 2026-05-19
updated: 2026-05-19
howto: 
---

  1. 新增 engine/notification.py — 非同步 dispatcher
     - 掃描 skills/*/settings.json 讀取 Notification hooks
     - asyncio.create_subprocess_exec 執行 hook script
     - 傳入標準 JSON payload: { event, title, message, level, task_id, project }
  2. 在 engine/skills/task_executor.py 插入
     - line 92: task_start
     - line 100: task_complete
     - line 109: task_error
  3. 在 engine/nodes/supervisor_node.py line 31-83 插入 session_complete
  4. 驗證：speak 會朗讀通知，send-telegram-mgs 會發 Telegram

# T096 - 引擎通知 Dispatch

## 目標
讓 mindnav-codeagent 的 Python 引擎在任務開始/完成/錯誤時，自動觸發 `speak` 和 `send-telegram-mgs` 的 Notification hooks。

## 驗收標準
- [x] `engine/notification.py` 存在，能讀取 skills 的 settings.json 並 dispatch
- [x] `task_start` 事件觸發 speak + Telegram
- [x] `task_complete` 事件觸發 speak + Telegram
- [x] `task_error` 事件觸發 speak + Telegram
- [x] `session_complete` 事件觸發通知（含摘要）
- [x] 非同步執行，不 blocking graph 流程
- [x] hook script 失敗不影響引擎正常運作（全部 wrapped in try/except）

## 備註
- speak script 在 macOS 用 `say` 朗讀，僅限 macOS
- send-telegram-mgs script 需 `TELEGRAM_BOT_TOKEN` + `TELEGRAM_CHAT_ID` 環境變數
- 若無對應環境變數或 platform 不符合，應 graceful skip
- 參考現有 script 的 stdin JSON 格式：`{ message, title, level?, destination? }`
