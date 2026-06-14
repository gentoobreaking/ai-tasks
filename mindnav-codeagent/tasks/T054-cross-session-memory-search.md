---
github_issue: https://github.com/openclawchen8-lgtm/openclaw-tasks/issues/577
title: T054 - 跨 Session 記憶全文搜尋與 AI 摘要
type: Feature
priority: high
status: done
assignee: OpenCode DeepSeek V4 Flash
created: 2026-05-18
updated: 2026-05-18
howto: implement
---

# T054 - 跨 Session 記憶全文搜尋與 AI 摘要

## 目標
目前 `MemoryManager` 只管理單一 session 的 token 用量/pruning，`RAG` 有 ingest 但 inference 無人查。需實作跨 session 的全文搜尋 + AI 摘要系統，讓 agent 能檢索過去所有對話階段的上下文。

參考 Hermes `tools/session_search_tool.py`（FTS5 + LLM summarization）與 `agent/memory_manager.py`（context fences）。

## 驗收標準
- [x] 新增 `engine/core/cross_session_memory.py`：
  - 使用 FTS5（sqlite3 內建）建立跨 session 全文索引，LIKE 後備支援 CJK
  - 每次對話結束時自動將 `messages` 摘要 + ingest 到索引
  - 支援 FTS5 關鍵字搜尋 + LIKE 混合檢索
- [x] 新增 `engine/core/session_summarizer.py`：
  - 呼叫 LLM 對 session 內容做結構化摘要（決策、成果、待辦、技術選型）
  - 摘要結果持久化至 `data/session_summaries/`（JSONL，按日輪轉）
  - 摘要 token 預算可配置（預設 300 tokens）
- [x] 在 `engine/nodes/base.py` 的 `agent_node` 中新增可選的上下文注入 hook
  - 呼叫 `cross_session_memory.search()` 檢索相關歷史
  - 結果以 `<memory-context>` 圍欄格式注入 system prompt
- [x] 支援 `<memory-context>` 圍欄格式（參考 Hermes context-fence 設計）
- [x] 擴充 `config/agents.yaml` 的 `memory_policy`：
  - `summary_token_budget`、`cross_session_memory.enabled/max_search_results/fts_engine`
- [x] 單元測試覆蓋：search（12 tests, all passed）
- [x] 相容現有 `MemoryManager`（pruning 仍由它負責）

## 備註
- 此為其他所有 skill/記憶功能的基礎，優先度最高
- Hermes 參考路徑：`tools/session_search_tool.py`、`agent/memory_manager.py`
- `.fbs-context-fences.mjs` 的圍欄模式已在你本機有實作經驗（FBS BookWriter），可直接參考
