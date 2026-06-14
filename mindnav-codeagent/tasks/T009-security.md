---
github_issue: https://github.com/gentoobreaking/ai-tasks/issues/516
title: T009 - 安全沙盒與指令限制
type: Feature
priority: high
status: done
assignee: gemini-cli
created: 2026-05-15
updated: 2026-05-15
---

# T009 - 安全沙盒與指令限制

## Description
實作沙盒安全機制，限制 Agent 執行 Shell 指令時的檔案讀寫與系統權限。

## Acceptance Criteria
- [x] 限制 Agent 只能在特定專案目錄下操作。
- [x] 實作指令白名單（如 linter, pytest）。
- [x] 防止 Agent 執行破壞性指令（如 rm -rf /）。

## Notes
- 實作了 `SafeShell` 類別於 `src/utils/security.py`。
- 支援指令白名單過濾與破壞性模式（destructive patterns）檢測。
- 強制在指定的 `cwd` 目錄下執行指令。
- 禁止使用絕對路徑與 `..` 目錄跳脫。
