---
github_issue: N/A
title: T039 - Evidence Gate 實作
type: feature
priority: high
status: pending
depends_on:
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-15
updated: 2026-08-18
---

# T039 - Evidence Gate 實作

## 目標
實作 Evidence Gate，自動判斷任務是否通過基於收集到的證據。

## 目標
- [ ] 實作閾值邏輯（通過/失敗判斷）
- [ ] 實作證據加權計算（不同來源權重不同）
- [ ] 實作 Gate API（`verifyGate(taskId: string)` → {status, score, reasons})
- [ ] 連接 Policy Engine 以重用準則評估
- [ ] 單元測試：Gate 決策正確率 ≥ 95%

## 規格對應
- Spec §14：Evidence Gate 章節
- 相依：T021 (Policy Engine), T038 (Evidence Model)

## 驗收標準
- 通過門檻：證據總分 ≥ 0.7（可調整）
- 失敗原因必須列出：哪些證據不足、權重不夠
- 響應格式：`{ status: "pass"|"fail", score: number, reasons: string[] }`

## 優先序
🔴 Critical（阻礙 Phase 1–5 生產可用）

## 預估工時
1–2 天

## 受影響檔案
- `src/api/client.ts` - 新增 verifyGate 函數
- `src/components/EvidenceGate.tsx` - 新增元件
- `tests/**/*.test.ts` - 新增證據閘測試
