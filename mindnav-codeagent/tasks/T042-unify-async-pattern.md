---
github_issue: https://github.com/openclawchen8-lgtm/openclaw-tasks/issues/546
title: T042 - 統一所有節點為 Async 模式
type: Bug
priority: critical
status: done
assignee: OpenCode DeepSeek V4 Flash Free
created: 2026-05-16
updated: 2026-05-16
howto: fix
---

# T042 - 統一所有節點為 Async 模式

## 目標
`engine/graph.py` 中部分節點是 `async def`（pm_node）、部分是一般 `def`（coder_node_func 等），且 Coder 使用同步 `invoke()` 而非 `ainvoke()`。在 Asyncio 事件循環中執行同步呼叫會阻塞整個 Telegram Bot。

## 驗收標準
- [x] 所有節點函數統一改為 `async def`
- [x] 所有 `llm.invoke()` 改為 `await llm.ainvoke()`
- [x] supervisor.route() 改為非同步（Supervisor 內也改用 `ainvoke`）
- [x] 確認 `build_project_graph().astream()` 運作正常

## 備註
- pm_node 已經是 async，但內部對 context_manager.prune_context 的呼叫也要確認
- 同步 invoke 在本地模型（延遲 10-20s）時會完全卡住事件循環
