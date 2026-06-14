---
github_issue: https://github.com/openclawchen8-lgtm/openclaw-tasks/issues/514
title: T007 - Telegram 進階功能 (專案切換與按鈕互動)
type: Feature
priority: medium
status: done
assignee: gemini-cli
created: 2026-05-15
updated: 2026-05-15
---

# T007 - Telegram 進階功能 (專案切換與按鈕互動)

## Description
實作 /set_project 指令與 Inline Keyboard 互動按鈕，完成雙管道（群組/頻道）互動。

## Acceptance Criteria
- [x] 實作 /set_project 命令，異步初始化 Chroma 實例。
- [x] 實作 Inline Keyboard「確認/退回」按鈕，用於進度審查。
- [x] 實作雙管道邏輯：討論在群組，審核在頻道。

## Notes
- 實作於 `src/interface/tg_bot.py`。
- `/set_project` 使用 `asyncio.get_running_loop().run_in_executor` 避免阻塞事件循環。
- PM 節點在任務完成時會顯示 Inline Keyboard。
- 支援透過 `TELEGRAM_REPORT_CHANNEL_ID` 發送審核報告。
