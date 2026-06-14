---
github_issue: https://github.com/openclawchen8-lgtm/openclaw-tasks/issues/489
title: T020 - 記憶清理與對話重置工具 (Memory Manager)
type: Feature
priority: high
status: done
assignee: gemini-cli
created: 2026-05-15
updated: 2026-05-15
---

# T020 - 記憶清理與對話重置工具

## Description
提供 `/forget` 指令，允許用戶針對特定專案重置 Redis 中的對話狀態與檢查點，維持系統最佳效率。

## Acceptance Criteria
- [ ] 實作 `/forget` 指令，刪除指定 `thread_id` 的所有 Redis 紀錄。
- [ ] 實作 `/memory_stats` 指令，回報當前專案記憶體佔用狀態。
- [ ] 確保操作後系統能無縫重新開始協作工作流。
