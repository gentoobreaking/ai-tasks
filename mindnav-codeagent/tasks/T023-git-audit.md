---
github_issue: https://github.com/openclawchen8-lgtm/openclaw-tasks/issues/525
title: T023 - Git 自動審計與原子提交流水線 (Git Audit Pipeline)
type: Feature
priority: high
status: done
assignee: gemini-cli
created: 2026-05-15
updated: 2026-05-15
---

# T023 - Git 自動審計與原子提交流水線 (Git Audit Pipeline)

## Description
實現 Git 流水線自動化，確保每個原子任務完成後自動提交代碼。引入容錯策略，當 Commit/Push 失敗時，根據設定執行自動回滾或暫停並通知人工。

## Acceptance Criteria
- [x] 實作 `engine/tools/git_audit.py`，封裝 `add` -> `commit` -> `push` 邏輯。
- [x] 實作 `rollback_skill`，利用 `git reset --hard` 還原至變更前狀態。
- [x] 加入至 `engine/graph.py` 中的工具清單。

## Notes
- Git 操作均通過 `SafeShell` 執行，確保安全。
- 提供了原子化提交與回滾能力，確保開發紀律。

