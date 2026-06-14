---
github_issue: https://github.com/gentoobreaking/ai-tasks/issues/488
title: T018 - RAG 自動增量同步監聽器 (watchdog based)
type: Feature
priority: high
status: done
assignee: gemini-cli
created: 2026-05-15
updated: 2026-05-15
---

# T018 - RAG 自動增量同步監聽器

## Description
利用 watchdog 機制監聽項目原始碼變更，並實作帶有「防彈跳 (Debounce)」機制的增量索引更新，確保 Agent 永遠讀取最新程式碼且不因頻繁保存導致效能損耗。

## Acceptance Criteria
- [ ] 實作 `engine/tools/rag_sync.py`，監控專案目錄。
- [ ] 在 `config/agents.yaml` 中增加 `rag_config` 區塊，支援 `sync_interval_seconds` 參數 (預設 600 秒)。
- [ ] 實現基於時間視窗的增量同步，防止短時間內重複觸發。
- [ ] 提供 `/sync_rag` 手動強制觸發同步指令。

## Notes
- 預設防彈跳間隔為 600 秒 (10 分鐘)。
- 監聽器應具備錯誤處理，若在同步過程中發生檔案鎖定應自動重試。
- 監控策略：監聽檔案寫入事件，透過時間戳記比對實現 Debounce。
