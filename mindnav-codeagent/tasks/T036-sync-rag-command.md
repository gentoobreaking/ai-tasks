---
github_issue: https://github.com/gentoobreaking/ai-tasks/issues/540
title: T036 - 實作手動強制同步指令 /sync_rag
type: Feature
priority: medium
status: done
assignee: OpenCode DeepSeek V4 Flash Free
created: 2026-05-16
updated: 2026-05-16
howto: implement
---

# T036 - 實作手動強制同步指令 /sync_rag

## 目標
T018 的 AC 第 4 項提到需提供 `/sync_rag` 手動強制觸發同步指令，但 `interface/tg_bot.py` 中尚未實作此功能。用戶應能透過 Telegram 發送 `/sync_rag` 手動觸發 RAG 增量同步，而不必等待 watchdog 的 Debounce 間隔。

## 驗收標準
- [x] 在 `interface/tg_bot.py` 中新增 `/sync_rag` CommandHandler
- [x] 執行時強制觸發 `LocalProjectKnowledgeBase` 的增量同步
- [x] 同步完成後返回結果摘要（新增/更新的文件數量）
- [x] 若無專案初始化（未執行 `/set_project`），提示用戶先設定專案
- [x] 在 `/start` 幫助訊息中加入 `/sync_rag` 說明

## 備註
- 同步邏輯可複用 `RAGSyncHandler` 或直接調用 `kb.ingest_code()`
- 需在同步過程中使用非阻塞方式執行，避免 Block 事件循環
