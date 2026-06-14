---
github_issue: https://github.com/openclawchen8-lgtm/openclaw-tasks/issues/509
title: T002 - 本地 RAG 知識庫實作 (ChromaDB & AST)
type: Feature
priority: high
status: done
assignee: gemini-cli
created: 2026-05-15
updated: 2026-05-15
---

# T002 - 本地 RAG 知識庫實作 (ChromaDB & AST)

## Description
實作 LocalProjectKnowledgeBase 類別，整合 Tree-Sitter/LanguageParser 進行程式碼 AST 切分，並使用 ChromaDB 儲存向量。

## Acceptance Criteria
- [x] 實作 AST 切分器，支援 Python/JS 等語言。
- [x] 整合 bge-large-zh-v1.5 嵌入模型進行向量化。
- [x] 支援多標籤（code, spec, live_log）隔離存儲與檢索。
- [x] 整合 BM25 實現混合檢索（Ensemble Retriever）。

## Notes
- 整合了 `pathspec` 以支援 `.gitignore` 過濾。
- 使用 `langchain-huggingface` 與 `BAAI/bge-large-zh-v1.5` 模型。
- 混合檢索權重配置：Vector (0.7) + BM25 (0.3)。
- 實作位於 `src/knowledge_base/local_kb.py`。
