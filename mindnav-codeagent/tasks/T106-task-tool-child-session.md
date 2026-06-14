---
github_issue: https://github.com/gentoobreaking/ai-tasks/issues/621
type: Feature
priority: P0
status: done
assignee: OpenCode DeepSeek V4 Flash
created: 2026-05-21
updated: 2026-05-21
howto:
---

  1. 建立子 session 管理機制：child session 有獨立的 state、messages、生命週期
  2. 改造 task_executor 從平坦 DAG 改為可巢狀 spawn subagent session
  3. Supervisor 偵測到需子代理工作時，透過 Task tool spawn child session
  4. child session 完成後將結果合併回 parent session
  5. parent session 可查詢 child session 狀態（進行中/完成/失敗）
  6. 支援 Session 導航：類似 OpenCode 的 Right/Left/Up 切換 parent/child
  7. 限制巢狀深度（預設 3 層）避免無限遞迴
  8. 更新測試驗證巢狀 spawn 與結果合併

# T106 - Task Tool + Child Session Spawning

## 目標
實作類似 OpenCode Task tool 的巢狀子 session 機制，讓 primary agent 可 spawn subagent 在獨立 session 中執行任務，完成後合併結果。

## 驗收標準
- [x] child session 有獨立 state 與生命週期
- [x] task_executor 支援巢狀 spawn subagent（透過 spawn_subagent tool）
- [x] Supervisor 可 spawn child session 並等待結果
- [x] child 完成後結果合併回 parent
- [x] parent 可查詢 child 狀態（list_child_sessions tool）
- [ ] Session 導航支援 parent/child 切換（待前端/TUI 配合）
- [x] 巢狀深度限制（預設 3 層）

## 備註
- child session 使用自身的 agent config（model, temperature, permissions）
- 合併結果時注意 message 順序與 context 大小
- 參考 OpenCode 的 Task tool 實作模式
