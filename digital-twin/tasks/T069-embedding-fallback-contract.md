---
github_issue: null
title: embedding 降級契約修復（openai provider 缺 key 不再 raise）
type: fix
priority: medium
status: done
depends_on: []
assignee: OpenCode with DeepSeek V4 Flash
created: '2026-08-12'
updated: '2026-08-12'
---
# T069 - embedding 降級契約修復

## 目標
`embedding.py:16` 與 `get_provider()` docstring（:207-210）宣稱 embedding 永遠可用（缺模型自動降級 hash），但 `OpenAIProvider.__init__` 在 `OPENAI_API_KEY` 缺失時 raise `ValueError`（embedding.py:140-141），而 constructor 在 `get_provider()`（:216）內就被呼叫 — 位於 `_safe_embed`（:48-54）之外。因此 `EMBEDDING_PROVIDER=openai` 且無 key 時是 raise 而非降級 hash，違反契約。

## 驗收標準
- [x] `EMBEDDING_PROVIDER=openai` 缺 `OPENAI_API_KEY` 時 `get_provider()` 回傳 hash provider（或等價降級），不 raise
- [x] key 存在時行為不變（仍走 openai）
- [x] 新增測試：缺 key 情境下 `embed()` / `embed_query()` 回傳確定性 hash 向量、不 raise
- [x] 既有 test_embedding.py 全過，pytest 全量通過
- [x] ruff / pyright 通過

## 備註
- 降級時可比照 `EMBEDDING_PROVIDER=hash` 行為；若 `EMBEDDING_DIM` 已設定則維持該維度
- 注意 `_safe_embed` 與 constructor 之間的分層：修正應落在 `get_provider` 的選擇邏輯，而非讓 `_safe_embed` 攔截

## 實作摘要（2026-08-12）
- `get_provider()`：`EMBEDDING_PROVIDER=openai` 分支包 try/except `ValueError`（缺 `OPENAI_API_KEY`）→ print 告警 + 降級 `HashEmbeddingProvider`（沿用 `EMBEDDING_DIM`）。
- 修正落在選擇邏輯（符合備註分層要求），未動 `_safe_embed`；direct `OpenAIProvider()` 仍 raise（測試保留）。
- `EmbeddingProvider` 基底補 `api_key = ""` 屬性宣告（pyright 型別）。
- 新增 3 測試：缺 key 降級 + embed/embed_query 確定性、EMBEDDING_DIM 沿用、key 存在仍走 openai。
- 全量 pytest 254 passed、ruff / pyright 通過。
- commit: `1e1623f`
