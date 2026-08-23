---
github_issue: N/A
title: embedding.py HTTP 呼叫遷移至 httpx（接入既有韌性層）
type: refactor
priority: medium
status: done
depends_on: []
assignee: "pi with opencode/x-preview-f-free"
created: 2026-08-24
updated: 2026-08-24
---

# T095 - embedding.py 統一使用 httpx

## 目標
專案的對外 HTTP 呼叫已收斂兩套模式：common/notify.py 與
discussion_orchestrator/adapters.py 用 httpx.AsyncClient + tenacity retry +
pybreaker 熔斷；唯獨 embedding.py:154,183 用裸 urllib.request.urlopen ——
無 retry、無 breaker、同步阻塞，行為與其他模組不一致。

1. OpenAIEmbeddingProvider / OllamaEmbeddingProvider 的 urlopen 呼叫改為 httpx
   （embedding 於索引流程屬批次場景，可用 httpx.Client 同步版即可，
   不強制 async 化整條索引流程）
2. 失敗重試：沿用 adapters.py 的 tenacity 參數慣例（3 次、指數退避），
   或最簡版 for-loop 3 次 —— 以專案內已有 pattern 為準
3. 降級契約不變：_safe_embed 攔截例外後退回 HashEmbeddingProvider
   （embedding.py:46-49 行為保持，測試 test_embedding.py 不應需要大改）

## 驗收標準
- [ ] embedding.py 不再 import urllib.request / urllib.error
- [ ] 對 5xx / 連線逾時有重試；重試耗盡才走 hash 降級
- [ ] tests/test_embedding.py 全數通過；新增至少一個重試行為測試（mock transport）
- [ ] ruff check 變更檔全綠

## 備註
- httpx 已是必裝依賴，無新增依賴成本
- 注意 ollama embed 端點是 /api/embed（非 OpenAI 格式），遷移時保留原 request body
