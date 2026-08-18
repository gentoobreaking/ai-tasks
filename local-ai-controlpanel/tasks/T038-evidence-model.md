---
github_issue: N/A
title: T038 - Evidence Model 實作
type: feature
priority: high
status: done
depends_on:
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-15
updated: 2026-08-18
---

# T038 - Evidence Model 實作

## 目標
實作 Evidence Model，支援任務審查的證據收集、來源標記與評分機制。

## 目標
- [x] 定義 Evidence 類型（文獻、代碼執行結果、外部 API 響應、專案記憶、風格知識庫）
- [x] 實作證據來源標記（原始出處、鏈接、時間戳、元數據）
- [x] 實作證據評分模型（可信度、相關性、及時性、加權總分）
- [x] 連接 Verification Engine 以重用驗證結果
- [x] 連接 Research Engine 以重用研究結果
- [x] 單元測試：證據完整性檢查通過（22 測試全部通過）

## 規格對應
- Spec §13：Evidence Model 章節
- 相依：T021 (Verification Engine), T037 (Research Engine)

## 驗收標準
- 所有驗證結果必須有對應證據 ✅
- 證據評分範圍 0.0–1.0，及格線 ≥ 0.7 ✅
- 來源標記必須包含：類型、URL/路徑、存取時間 ✅

## 優先序
🔴 Critical（阻礙 Phase 1–5 生產可用）

## 預估工時
1 天

## 受影響檔案
- `apps/control-plane/src/evidence/types.ts` - 類型定義
- `apps/control-plane/src/evidence/model.ts` - Evidence Model 核心實作
- `apps/control-plane/src/evidence/gate.ts` - 現有 Evidence Gate（已存在）
- `apps/control-plane/src/routes/evidence.ts` - REST API 路由
- `apps/control-plane/src/server.ts` - 註冊路由與依賴注入
- `src/api/client.ts` - 前端客戶端函數
- `apps/control-plane/tests/unit/evidence-model.test.ts` - 22 個單元測試

## 任務完成摘要

### 完成時間
2026-08-18

### 實作內容
1. **Evidence 類型定義** (`apps/control-plane/src/evidence/types.ts`)
   - 5 種證據類型：documentation、code_execution、external_api、memory、style_kb
   - 完整的來源標記：類型、ID、標題、URL、片段、完整內容、可信度、相關性、及時性、加權分數、存取時間、建立時間、元數據
   - 預設評分權重與通過門檻（0.7）

2. **Evidence Model 核心** (`apps/control-plane/src/evidence/model.ts`)
   - 證據收集：整合 Research Engine（專案記憶、風格知識庫）+ Verification Engine（代碼執行結果）
   - 評分模型：可信度（按類型基礎分 + 元數據調整）、相關性、及時性（時間衰減）、加權總分
   - 去重機制：基於類型、ID、片段的去重
   - 支援類型過濾、最小分數過濾、結果數量限制

3. **REST API** (`apps/control-plane/src/routes/evidence.ts`)
   - `POST /api/v1/evidence` - 收集證據
   - `GET /api/v1/evidence/:taskId?q=...` - 便捷查詢

4. **前端客戶端** (`src/api/client.ts`)
   - `collectEvidence(query: EvidenceQuery)` - POST 版本
   - `collectEvidenceGet(taskId, opts)` - GET 版本

4. **單元測試** (22 測試全部通過)
   - 常數與門檻驗證 (2)
   - 可信度計算 (5 種類型)
   - 及時性計算 (4)
   - 加權分數計算 (1)
   - 去重 (1)
   - 工廠函數 (1)
   - 證據創建方法 (3)
   - 權重管理 (1)
   - collectEvidence 整合測試 (4)

### 驗證結果
- Typecheck: ✅ 通過
- 單元測試: 22/22 通過
- 全測試套件: 211 pass / 3 fail (3 個既有失敗)
- CLI 測試: 24/24 通過
