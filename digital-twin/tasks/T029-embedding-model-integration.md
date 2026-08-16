---
github_issue: 
title: RAG Embedding Model 整合 (LanceDB 向量搜尋)
type: feature
priority: medium
status: done
spec_version: v3
commit: a1c28f0
depends_on: []
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-06
updated: 2026-08-08
commit: 3975424
summary: embedding.py 四 provider + 向量化索引/遷移/ANN + reindex --embed + 語意測試,15 tests,真實庫 8200 段實跑
---

# T029 - RAG Embedding Model 整合 (LanceDB 向量搜尋)

## 目標
T009 引入 LanceDB 但目前 `vector_search` 為 placeholder（回退到 BM25），未啟用真正的向量搜尋。需整合 embedding model（OpenAI / 本地 ollama / sentence-transformers）以啟用語意向量搜尋，並支援 BM25 + Vector 混合檢索 (RRF) 的完整功能。

## 驗收標準
- [x] 新增 `embedding.py`：統一介面 `embed(texts: list[str]) -> list[list[float]]`，支援多 provider（OpenAI、ollama、sentence-transformers）——外加 hash 無模型降級
- [x] `incremental_index.py`：索引階段自動計算向量並寫入 LanceDB（`index --embed` / `reindex --embed`，批次向量化）
- [x] `vector_search(query, top_k)`：使用 query embedding 執行向量搜尋（LanceDB ANN，cosine；無向量資料自動退回 BM25）
- [x] `hybrid_search`：BM25 + Vector RRF 融合生效（向量權重 alpha 可配置，`--alpha`）
- [x] CLI `incremental_index.py reindex --embed` 可觸發向量化重建（+ANN IVF-PQ 建立）
- [x] 配置可透過 `.env` 切換 provider：`EMBEDDING_PROVIDER=openai|ollama|local`（+hash）、`EMBEDDING_MODEL=...`、`EMBEDDING_DIM`、`EMBEDDING_BASE_URL`
- [x] 測試：向量搜尋能找到語意相關但關鍵字不匹配的片段（真實 MiniLM 英文案例 + CJK hash 案例）

## 備註
- sentence-transformers 已安裝至 .venv（`rag` extras 新增 `lancedb>=0.36`、`sentence-transformers>=3.0`）
- ollama 本機服務未以 `--embeddings` 啟動 → 實際用 local provider；ollama/openai 走惰性載入，失敗自動降級 hash
- 既有表遷移：缺 vector 欄時 `add_columns` 自動補 nullable 欄位，再 `reindex --embed` 填值
- 真實驗收：真實知識庫（原 10 行無向量表）`reindex --embed` → 8200 段含向量、ANN 建立成功、vector search 正常回傳語意相關片段
- 測試：`tests/test_embedding.py`(8) + `test_vector_search.py`(6) + `test_semantic_vector_search.py`(1,真實模型)；全量 **105 passed + 1 skipped**；ruff/pyright 0 errors