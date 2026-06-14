---
github_issue: https://github.com/openclawchen8-lgtm/openclaw-tasks/issues/556
title: T052 - verify_ac.py stub 檢查補全
type: Feature
priority: medium
status: done
assignee: OpenCode DeepSeek V4 Flash Free
created: 2026-05-16
updated: 2026-05-16
howto: implement
---

# T052 - verify_ac.py stub 檢查補全

## 目標
`scripts/verify_ac.py` 的 `AC_CHECKS` 中有多處使用 `lambda: True`（T002 AST 切分器、bge-large 嵌入、多標籤隔離；T013 遷移完成）或 `has_kb` 佔位符，沒有真正檢查對應功能。

## 驗收標準
- [x] T002 AST 切分器：`_check_rag_components()` 實質使用 `RecursiveCharacterTextSplitter` 解析 Python 樣本
- [x] T002 bge-large 嵌入：`_check_embeddings()` 實質載入 `HuggingFaceEmbeddings` 並產出向量
- [x] T002 多標籤隔離：`_check_chroma_filter()` 實質使用 ChromaDB in-memory 過濾 `source_type`
- [x] T002 BM25 混合檢索：`_check_bm25()` 實質測試 `BM25Retriever.invoke()`
- [x] T013 遷移完成：`_check_migration_complete()` 確認 `engine/` 下無 `ChatOllama` 硬編碼
- [x] 移除所有 `lambda: True` 與 `has_kb` 佔位符（已用實質函數取代）

## 備註
- 受影響任務：T002、T013
- 這些檢查應使用 `importlib` 實際載入模組並呼叫功能
