# T037 - Research Engine 實作

## 目標
實作 Research Engine，支援文獻檢索、證據收集與分析。此功能是 Baseline 驗證與指標計算的基礎。

## 目標
- [ ] 實作文獻檢索函數（query expansion、3-gram 相似度匹配）
- [ ] 實作證據收集機制（來源標記、可信度評分）
- [ ] 實作 Research Engine API（`research(taskId: string)`）
- [ ] 連接 Memory Retriever 以重用向量索引
- [ ] 單元測試：100% 覆蓋率

## 規格對應
- Spec §11：Research Engine 章節
- 相依：T029 (RAG 風格知識庫), T032 (Memory Retriever)

## 驗收標準
- 文獻檢索準確率 ≥ 85%（測試集驗證）
- 證據收集完整度 ≥ 90%（所有來源皆有標記）
- API 響應時間 ≤ 2 秒（單筆查詢）

## 優先序
🔴 Critical（阻礙 Phase 1–5 生產可用）

## 預估工時
1–2 天

## 受影響檔案
- `src/api/client.ts` - 新增 research 函數
- `src/components/ResearchEngine.tsx` - 新增元件
- `tests/**/*.test.ts` - 新增研究引擎測試