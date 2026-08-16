---
github_issue: null
title: worker RAG 同步搜尋改 asyncio.to_thread（避免阻塞 event loop）
type: fix
priority: medium
status: done
spec_version: v3
commit: a1c28f0
depends_on: [72]
assignee: OpenCode with DeepSeek V4 Flash
created: '2026-08-12'
updated: '2026-08-14'
---
# T075 - worker run_rag_task 改非阻塞執行

## 目標
`worker.py:167-191` 的 `run_rag_task` 直接呼叫同步的 `search_knowledge_base(query, top_k=3)`（:175），而 `worker_loop` 直接 await 它（:251,257）。一次 LanceDB/BM25 查詢會凎結 event loop，阻塞其他 pending task（含 /discuss）。改以 `asyncio.to_thread` 執行同步搜尋。

## 驗收標準
- [x] `run_rag_task` 的同步搜尋改由 `asyncio.to_thread` 執行，event loop 不再被搜尋阻塞
- [x] 搜尋結果（formatted text + files）與先前一致
- [x] 既有 RAG task 測試全過
- [x] pytest 全量通過、ruff / pyright 通過

## 實作摘要

### 設計
`search_knowledge_base`（→ `_search_impl` → `collect_markdown_files` + `parse_doc_sections` +
純計算評分）僚有同步檔 I/O，會阻塞 asyncio event loop。將呼叫包裹在
`asyncio.to_thread()`，使搜尋在執行緒池執行，event loop 得以處理其他任務。

**Thread safety 檢查**：
- `collect_markdown_files()` 使用模組級唯讀 `Path` 常數（`NOTES_DIR` / `TASKS_DIR` /
  `CURRENT_DIR`），無可變共享狀態
- `parse_doc_sections` 為純函數（檔案讀取 + 字串處理）
- `observability.record_duration` 透過 OTEL meter 的 `record()`，OTEL SDK 內部
  thread-safe
- `sys.path.insert` 與 `from index_knowledge import search_knowledge_base` 均在
  `to_thread` 之外（僅 `search_knowledge_base` 呼叫並入執行緒）

### 變更
- `worker.py:124`：`results = search_knowledge_base(query, top_k=3)` →
  `results = await asyncio.to_thread(search_knowledge_base, query, top_k=3)`

### 驗證
- `test_rag_executes` / `test_unknown_task_type_not_crash`：passed
- pytest 全量：262 passed + 1 skipped
- ruff：All checks passed
- pyright：0 errors, 0 warnings

## 備註
- 依賴 T072 收斂後的 search 介面（`search_knowledge_base` 簽名不變）
- LanceDB embedded 連線未被 `search_knowledge_base` 使用（採 BM25/關鍵詞評分），
  無 thread-safety 疑慮