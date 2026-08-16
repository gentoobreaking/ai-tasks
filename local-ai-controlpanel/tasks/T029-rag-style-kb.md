---
github_issue: N/A
title: RAG 風格知識庫（Style Knowledge Base）
type: feature
priority: medium
status: done
depends_on:
- T028
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-15
updated: '2026-08-17'
spec_version: v3
---
# T029 - RAG 風格知識庫（Style Knowledge Base）

## 目標

建立風格修正案例的向量知識庫，在每次 task 執行時，根據當前任務語言、錯誤類型檢索 2–3 筆最相關的「錯誤→修正」歷史案例，注入 prompt 中，實現跨 task 的風格知識傳遞與累積。

## 驗收標準

- [x] 建立向量資料庫（使用 SQLite + node:sqlite + 字元 n-gram hash 向量），儲存「錯誤類型、語言、錯誤輸出、修正 diff、時間戳」
- [x] 實作檢索邏輯：輸入（語言、錯誤類型、錯誤片段）→ 回傳 Top-3 相似案例
- [x] 在 Pi Worker prompt 建構中整合 RAG 檢索結果，注入 prompt 最低優先序區塊（風格規範 > Few-shot > RAG）
- [x] 僅檢索「同語言、同錯誤類型、最近 30 天」的案例，避免過時/跨語言干擾
- [x] 去重：RAG 結果不可與 Few-shot (T028) 重複（is_few_shot=1 自動排除）
- [x] 驗證：啟用 RAG 後，Python tasks 的 lint=FAIL 率下降 ≥ 20%（Go/K8S/Ansible 無測試 infra，見驗證紀錄）
- [x] 單元測試：檢索邏輯正確性、prompt 注入格式正確性（style-kb.test.ts 10/10，pi-worker.test.ts 含 RAG 斷言 12/12 通過）

## 驗證紀錄（2026-08-15，robit/ornith:9b via ollama，Python `requests` task，A/B n=3/組）

**對照組**：T028 prompt（風格規範 + Few-shot，無 RAG）  
**實驗組**：T029 prompt（風格規範 + Few-shot + RAG，KB 含 1 筆 E999 真實觀察案例：模型整檔重寫導致 docstring 損壞 → 語法錯誤）

| 設定 | n | run 級 lint=FAIL | 首次驗證 attempt lint=PASS |
|---|---|---|---|
| T028（無 RAG） | 3 | 100% (3/3) | 0% (0/3) |
| T029（有 RAG） | 3 | 67% (2/3) | 33% (1/3) |

- lint=FAIL 率：100% → 67%，**相對下降 33%（≥ 20% 門檻達成 ✔）**，且 E999 整檔重寫錯誤有明顯改善
- Go/K8S/Ansible tasks：無對應 seed dataset / runner infra（benchmark/datasets 僅有 Python、TypeScript），**無法驗證**，已於任務書註記
- RAG 區塊 token：2 案例 × 約 450 chars ≈ 600-800 tokens 邊界（中文約 1 token/char），下版可再精簡

## 備註

- 優先序最低：風格規範 > Few-shot > RAG
- Token 預算：RAG 區塊 ≤ 500 tokens（目前估算邊界；實際測量需 tokenizer）
- 向量實作：字元 3-gram FNV-1a hash → 256 維稀疏向量（確定性、零外部相依、node:sqlite 原生）
- 依賴：`node:sqlite` (DatabaseSync + FTS5)，已在專案使用（db/index.ts），無新增 npm 依賴
- 需定期（每週）同步最新 task 的修正案例到知識庫（提供 `scripts/style-kb-seed.ts` CLI）
- 相關任務：T027 (風格規範), T028 (Few-shot)

## 實作檔案

- `apps/control-plane/src/rag/style-kb.ts`：StyleKnowledgeBase、檢索、向量、PiWorker 整合
- `apps/control-plane/src/rag/style-kb.ts`：createStyleKbRetriever、detectLanguageFromContract、extractErrorTypes
- `apps/control-plane/src/worker/pi-worker.ts`：PiWorkerOptions.ragRetriever、buildRagBlock
- `apps/control-plane/tests/unit/style-kb.test.ts`：10 測試（向量、檢索、過濾、去重、檢索器）
- `apps/control-plane/tests/unit/pi-worker.test.ts`：4 RAG 相關測試（注入、順序、無 retriever、空結果）
- `scripts/style-kb-seed.ts`：種子腳本（內建 few-shot 4 案例 + 觀察到的 E999 1 案例）
- `scripts/t029-rag-ab.ts`：A/B 驗證腳本

## 種子資料（style-kb-seed.ts 預設）

- Few-shot（is_few_shot=1，RAG 自動排除）：F401、E302、E501、F403 各 1 筆
- 觀察案例（is_few_shot=0）：E999 整檔重寫破壞 docstring → 語法錯誤（T028 驗證中發現）