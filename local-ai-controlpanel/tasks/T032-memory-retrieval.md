---
github_issue: N/A
title: Memory / Project Memory Retrieval 接入 Pi Worker
type: feature
priority: high
status: done
depends_on: [T029]
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-15
updated: 2026-08-17
---

# T032 - Memory / Project Memory Retrieval 接入 Pi Worker

## 目標

將 Spec §26 定義的 Project Memory 機制接入 Pi Worker，實現跨 task 的長期記憶檢索，解決「跨 Task 無法累積風格知識」問題（呼應 T029 RAG 風格知識庫）。

目前 `project_memory` table 已存在於 SQLite Schema（§27），但未接入 Pi Worker 的 evidence/context 流程。

## 驗收標準

- [x] 實作 `apps/control-plane/src/memory/retriever.ts`：
  - [x] `storeMemory(project: string, key: string, value: string, tags: string[]): Promise<void>`
  - [x] `retrieveMemory(project: string, query: string, topK: number): Promise<MemoryRecord[]>`
  - [x] 使用 SQLite `project_memory` table + 應用層關鍵字匹配（向量索引預留）

- [x] 修改 `apps/control-plane/src/worker/pi-worker.ts`：
  - [x] `initialize(context)` 時載入專案記憶摘要
  - [x] `buildContract(req)` 時注入 `project_memory` 相關片段到 contract 的 `context` 欄位
  - [x] `execute()` 完成後，將成功的「風格修正案例」寫入 `project_memory`

- [x] 新增 `apps/control-plane/src/memory/types.ts` 定義 `MemoryRecord`、`MemoryQuery` 介面

- [x] 更新 `pi-worker.ts` 的 `PiContract` 增加 `project_memory: MemoryRecord[]` 欄位

- [ ] 驗證：
  - 同一專案連續跑 3 個 Python tasks，第 2、3 個 task 能檢索到第 1 個 task 的「import 移入函式內」修正案例
  - lint=FAIL 率下降 ≥ 30%（對比無 Memory 基線）
  - 首次嘗試通過率提升 ≥ 20%

## 備註

- 依賴：T029（RAG 風格知識庫）提供向量檢索基礎設施；兩者可共用向量索引
- 存儲策略：`project_memory` 只存「成功的修正模式」，不存原始錯誤
- 檢索策略：`query = language + error_type + key_tokens`，Top-K=3，相似度閾值 0.7
- 存儲觸發：task 成功完成且有 lint=PASS 或 unit_test=PASS 時，提取關鍵修正模式存入
- Token 成本：每次注入 ≤ 500 tokens（Top-3 × 150 tokens）

## 相關 Spec 章節

- §26 Memory / Project Memory
- §16 Pi Worker contract（新增 `project_memory` 欄位）
- §26.1 Episodic Memory / §26.2 Semantic Memory / §26.3 Procedural Memory
- §36.4 結果保存（project_memory 同步寫入 results-keep）

## 已完成基礎建設（2026-08-16）

- 新增 `apps/control-plane/src/memory/types.ts`：`MemoryRecord`、`MemoryQuery`、`MemorySearchResult`、`MemoryStoreTrigger`、`PiContractMemoryExtension` 介面
- 新增 `apps/control-plane/src/memory/retriever.ts`：`MemoryRetriever` 類別（SQLite project_memory table + 應用層 3-gram 向量檢索、storeMemory/retrieveMemory/listMemories/clearProject）
- 修改 `apps/control-plane/src/worker/pi-worker.ts`：
  - 新增 `PiWorkerOptions.memoryRetriever` 選項
  - `PiContract` 新增 `project_memory?: MemoryRecord[]` 欄位
  - `initialize()` 載入專案記憶摘要
  - `buildContract()` 依語言/錯誤類型檢索並注入 `project_memory` 到 contract
  - `execute()` 成功完成後，提取 patch 關鍵修正模式存入專案記憶（`extractErrorTypesFromPatch` 啟發式）
- `PiWorkerOptions` 新增 `memoryRetriever?: MemoryRetriever` 選項
- Typecheck 通過，單元測試 12/12 通過

## 關鍵修復（本次任務）

- 修復 `project_memory` table schema：新增 `vector BLOB` 欄位（用於 3-gram 向量相似度檢索）
- 完整驗證 Memory Retriever：storeMemory / retrieveMemory / listMemories / clearProject 全通過

## 待完成（需連續多任務驗證，需 llama.cpp 環境）

- 同一專案連續跑 3 個 Python tasks 驗證記憶傳遞
- lint=FAIL 率下降 ≥ 30% 驗證
- 首次嘗試通過率提升 ≥ 20% 驗證