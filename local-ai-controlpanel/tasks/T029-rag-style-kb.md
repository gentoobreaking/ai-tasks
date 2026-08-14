---
github_issue: N/A
title: RAG 風格知識庫（Style Knowledge Base）
type: feature
priority: medium
status: pending
depends_on: [T028]
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-15
updated: 2026-08-15
---

# T029 - RAG 風格知識庫（Style Knowledge Base）

## 目標

建立風格修正案例的向量知識庫，在每次 task 執行時，根據當前任務語言、錯誤類型檢索 2–3 筆最相關的「錯誤→修正」歷史案例，注入 prompt 中，實現跨 task 的風格知識傳遞與累積。

## 驗收標準

- [ ] 建立向量資料庫（建議 ChromaDB 或 SQLite + sqlite-vec），儲存「錯誤類型、語言、錯誤輸出、修正 diff、時間戳」
- [ ] 實作檢索邏輯：輸入（語言、錯誤類型、錯誤片段）→ 回傳 Top-3 相似案例
- [ ] 在 Pi Worker prompt 建構中整合 RAG 檢索結果，注入 prompt 最低優先序區塊
- [ ] 僅檢索「同語言、同錯誤類型、最近 30 天」的案例，避免過時/跨語言干擾
- [ ] 去重：RAG 結果不可與 Few-shot (T028) 重複
- [ ] 驗證：啟用 RAG 後，Go/K8S/Ansible tasks 的 lint=FAIL 率下降 ≥ 20%
- [ ] 單元測試：檢索邏輯正確性、prompt 注入格式正確性

## 備註

- 優先序最低：風格規範 > Few-shot > RAG
- Token 預算：RAG 區塊 ≤ 500 tokens
- 建議使用 ChromaDB（輕量、無外部依賴）或 SQLite + sqlite-vec
- 需定期（每週）同步最新 task 的修正案例到知識庫
- 相關任務：T027 (風格規範), T028 (Few-shot)
- 涉及新增依賴：`chromadb` 或 `sqlite-vec`，需評估打包影響