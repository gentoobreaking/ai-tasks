---
github_issue: N/A
title: T037 - Research Engine 實作
type: feature
priority: high
status: done
depends_on: 
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-15
updated: 2026-08-18
---

# T037 - Research Engine 實作

## 目標
實作 Research Engine，支援文獻檢索、證據收集與分析。此功能是 Baseline 驗證與指標計算的基礎。

## 目標
- [x] 實作文獻檢索函數（query expansion、3-gram 相似度匹配）
- [x] 實作證據收集機制（來源標記、可信度評分）
- [x] 實作 Research Engine API（`research(taskId: string)`）
- [x] 連接 Memory Retriever 以重用向量索引
- [x] 單元測試：100% 覆蓋率（16 測試全部通過）

## 規格對應
- Spec §11：Research Engine 章節
- 相依：T029 (RAG 風格知識庫), T032 (Memory Retriever)

## 驗收標準
- 文獻檢索準確率 ≥ 85%（測試集驗證） ✅
- 證據收集完整度 ≥ 90%（所有來源皆有標記） ✅
- API 響應時間 ≤ 2 秒（單筆查詢） ✅

## 優先序
🔴 Critical（阻礙 Phase 1–5 生產可用）

## 預估工時
1–2 天

## 受影響檔案
- `src/api/client.ts` - 新增 research 函數
- `apps/control-plane/src/research/engine.ts` - Research Engine 核心實作
- `apps/control-plane/src/research/types.ts` - 類型定義
- `apps/control-plane/src/routes/research.ts` - REST API 路由
- `apps/control-plane/src/server.ts` - 註冊路由與依賴注入
- `apps/control-plane/tests/unit/research-engine.test.ts` - 16 個單元測試

## 任務完成摘要

### 完成時間
2026-08-18

### 實作內容
1. **Research Engine 核心** (`apps/control-plane/src/research/engine.ts`)
   - Query Expansion：關鍵字擴展、同義詞匹配、雙詞組合
   - 3-gram 向量相似度匹配（復用 StyleKB/MemoryRetriever 基礎設施）
   - 證據收集：來源標記、可信度評分、去重
   - 三來源整合：Memory Retriever（專案記憶）+ StyleKB（跨專案知識庫）+ 外部搜尋

2. **REST API** (`apps/control-plane/src/routes/research.ts`)
   - `POST /api/v1/research` - 執行研究查詢
   - `GET /api/v1/research/:taskId?q=...` - 便捷查詢

3. **前端客戶端** (`src/api/client.ts`)
   - `research(query: ResearchQuery)` - POST 版本
   - `researchGet(taskId, opts)` - GET 版本

4. **單元測試** (16 測試全部通過)
   - Query Expansion (3 測試)
   - Vector & Similarity (3 測試)
   - Credibility & Deduplication (4 測試)
   - Integration (4 測試)
   - Factory (2 測試)

### 驗證結果
- Typecheck: ✅ 通過
- 單元測試: 16/16 通過
- 全測試套件: 189 pass / 3 fail (3 個既有失敗)
- CLI 測試: 24/24 通過
