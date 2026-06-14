---
github_issue: https://github.com/openclawchen8-lgtm/openclaw-tasks/issues/553
title: T049 - ChromaDB 初始化掃描優化
type: Performance
priority: low
status: done
assignee: OpenCode DeepSeek V4 Flash Free
created: 2026-05-16
updated: 2026-05-16
howto: refactor
---

# T049 - ChromaDB 初始化掃描優化

## 目標
`LocalProjectKnowledgeBase.__init__()` 每次都會呼叫 `_prune_old_collections()`，掃描所有 Collection 做過期清理。在頻繁切換專案或系統啟動時浪費 I/O。

## 驗收標準
- [x] 新增 `engine/knowledge_base/prune.py` CLI entry：`python -m engine.knowledge_base.prune`
- [x] `__init__()` 只建立 DB 連線，不執行清理（需傳入 `prune_on_init=True` 才執行）
- [x] 提供獨立 CLI entry：`python -m engine.knowledge_base.prune [persist_directory]`
- [x] 保留 `prune_on_init` 選項供需要立即清理的場景使用

## 備註
- 清理條件：超過 `retention_days`（預設 30 天）的 Collection
- 可納入 T021 驗證框架定期執行
