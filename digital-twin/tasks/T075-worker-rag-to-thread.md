---
github_issue: null
title: worker RAG 同步搜尋改 asyncio.to_thread（避免阻塞 event loop）
type: fix
priority: medium
status: pending
depends_on: [72]
assignee: OpenCode with DeepSeek V4 Flash
created: '2026-08-12'
updated: '2026-08-12'
---
# T075 - worker run_rag_task 改非阻塞執行

## 目標
`worker.py:167-191` 的 `run_rag_task` 直接呼叫同步的 `search_knowledge_base(query, top_k=3)`（:175），而 `worker_loop` 直接 await 它（:251,257）。一次 LanceDB/BM25 查詢會凍結 event loop，阻塞其他 pending task（含 /discuss）。改以 `asyncio.to_thread` 執行同步搜尋。

## 驗收標準
- [ ] `run_rag_task` 的同步搜尋改由 `asyncio.to_thread` 執行，event loop 不再被搜尋阻塞
- [ ] 搜尋結果（formatted text + files）與先前一致
- [ ] 既有 RAG task 測試全過
- [ ] pytest 全量通過、ruff / pyright 通過

## 備註
- 依賴 T072 收斂後的 search 介面；若 T072 未完成可先獨立處理（call site 不變）
- LanceDB embedded 連線非 thread-safe 與否需確認：若否，to_thread 前需確認連線使用方式（open_table 於每次呼叫內完成）