---
github_issue: 
title: RAG Embedding Model 整合 (LanceDB 向量搜尋)
type: feature
priority: medium
status: pending
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-06
updated: '2026-08-06'
---

# T029 - RAG Embedding Model 整合 (LanceDB 向量搜尋)

## 目標
T009 引入 LanceDB 但目前 `vector_search` 為 placeholder（回退到 BM25），未啟用真正的向量搜尋。需整合 embedding model（OpenAI / 本地 ollama / sentence-transformers）以啟用語意向量搜尋，並支援 BM25 + Vector 混合檢索 (RRF) 的完整功能。

## 驗收標準
- [ ] 新增 `embedding.py`：統一介面 `embed(texts: list[str]) -> list[list[float]]`，支援多 provider（OpenAI、ollama、sentence-transformers）
- [ ] `incremental_index.py`：索引階段自動計算向量並寫入 LanceDB（新增 vector column）
- [ ] `vector_search(query, top_k)`：使用 query embedding 執行向量搜尋（LanceDB ANN）
- [ ] `hybrid_search`：BM25 + Vector RRF 融合生效（向量權重 alpha 可配置）
- [ ] CLI `incremental_index.py reindex --embed` 可觸發向量化重建
- [ ] 配置可透過 `.env` 切換 provider：`EMBEDDING_PROVIDER=openai|ollama|local`、`EMBEDDING_MODEL=...`
- [ ] 測試：向量搜尋能找到語意相關但關鍵字不匹配的片段

## 備註
- 依賴 T009 完成（LanceDB schema 需支援 vector column）
- OpenAI embedding 需 `OPENAI_API_KEY`；ollama 需本地服務；sentence-transformers 純本地無外部依賴
- 建議預設使用 `sentence-transformers/all-MiniLM-L6-v2`（輕量、中英文支援佳）
- LanceDB 向量搜尋需建立 ANN index：`table.create_index(vector_column_name, config=IvfPq(...))`
- schema 變更需考慮遷移：既有資料重新索引或增加 vector column 為 nullable