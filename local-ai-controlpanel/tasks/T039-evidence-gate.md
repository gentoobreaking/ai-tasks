---
github_issue: N/A
title: T039 - Evidence Gate 實作
type: feature
priority: high
status: done
depends_on:
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-15
updated: 2026-08-18
---

# T039 - Evidence Gate 實作

## 目標
實作 Evidence Gate，自動判斷任務是否通過基於收集到的證據。

## 目標
- [x] 實作閾值邏輯（通過/失敗判斷）
- [x] 實作證據加權計算（不同來源權重不同）
- [x] 實作 Gate API（`verifyGate(taskId: string)` → {status, score, reasons}）
- [x] 連接 Policy Engine 以重用準則評估
- [x] 單元測試：Gate 決策正確率 ≥ 95%（15 測試全部通過）

## 規格對應
- Spec §14：Evidence Gate 章節
- 相依：T021 (Policy Engine), T038 (Evidence Model)

## 驗收標準
- 通過門檻：證據總分 ≥ 0.7（可調整） ✅
- 失敗原因必須列出：哪些證據不足、權重不夠 ✅
- 響應格式：`{ status: "pass"|"fail", score: number, reasons: string[] }` ✅

## 優先序
🔴 Critical（阻礙 Phase 1–5 生產可用）

## 預估工時
1–2 天

## 受影響檔案
- `src/api/client.ts` - 新增 verifyGate 函數
- `apps/control-plane/src/routes/verify-gate.ts` - REST API 路由（基於 taskId 的 Gate 判斷）
- `apps/control-plane/src/routes/evidence-gate.ts` - 通用 Gate API 路由
- `apps/control-plane/src/evidence/gate-api.ts` - Evidence Gate 核心邏輯
- `apps/control-plane/src/server.ts` - 註冊路由
- `apps/control-plane/tests/unit/evidence-gate.test.ts` - 15 個單元測試

## 任務完成摘要

### 完成時間
2026-08-18

### 實作內容
1. **Evidence Gate 核心邏輯** (`apps/control-plane/src/evidence/gate-api.ts`)
   - 閾值邏輯：證據總分 ≥ 0.7 通過（可調整）、最少證據數、單條最低分、高風險阻擋
   - 證據加權計算：5 類證據類型不同權重（code_execution=1.0, memory=0.9, style_kb=0.85, documentation=1.0, external_api=0.8）
   - 失敗原因列舉：insufficient_total_score、insufficient_evidence_count、low_single_score、high_risk_blocked
   - 高風險任務更嚴格門檻（需 ≥2 條證據且平均分 ≥ 0.8）

2. **REST API** 
   - `POST /api/v1/evidence/gate` - 通用 Gate 判斷（輸入證據列表）
   - `POST /api/v1/evidence/verify-gate` - 基於 taskId 的 Gate 判斷（自動收集證據並判斷）

3. **前端客戶端** (`src/api/client.ts`)
   - `evaluateEvidenceGate(input)` - 通用判斷
   - `verifyGate(input)` - 基於 taskId 的判斷

4. **單元測試** (15 測試全部通過)
   - 門檻值驗證 (2)
   - 基礎判斷邏輯 (5)
   - 風險等級處理 (2)
   - 自定義權重/門檻 (2)
   - 統計資訊與錯誤詳情 (2)

### 驗證結果
- Typecheck: ✅ 通過
- 單元測試: 15/15 通過
- 全測試套件: 217 pass / 0 fail / 2 skipped
- CLI 測試: 24/24 通過
