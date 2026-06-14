---
github_issue: https://github.com/gentoobreaking/ai-tasks/issues/513
title: T006 - Telegram 互動基礎建設 (Asyncio Polling)
type: Feature
priority: high
status: done
assignee: gemini-cli
created: 2026-05-15
updated: 2026-05-15
---

# T006 - Telegram 互動基礎建設 (Asyncio Polling)

## Description
使用 python-telegram-bot 實作全域非阻塞 Asyncio 事件循環，銜接 LangGraph 串流輸出。

## Acceptance Criteria
- [x] 支援從環境變數或 `.env` 檔案讀取 `TELEGRAM_BOT_TOKEN` 與 `TELEGRAM_CHAT_ID`。
- [x] 實作 Telegram Bot 基本監聽功能。
- [x] 實現 astream 串流輸出，將 Agent 思考過程即時發送到群組。
- [x] 處理併發鎖機制，確保多用戶同時發言時狀態不衝突。

## Notes
- 實作於 `src/interface/tg_bot.py`。
- 使用 `astream(stream_mode="updates")` 實現節點級別的實時反饋。
- 透過 LangGraph 的 `thread_id` 確保多對話隔離。
- 增加了對 Telegram 訊息長度限制（4096 字符）的處理。
