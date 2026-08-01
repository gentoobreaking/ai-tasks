---
github_issue: N/A
title: 六大正規化 Schema 與 Normalize 層（v2.1 §6）
type: feature
priority: high
status: pending
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-01
updated: 2026-08-01
---

# T022 - 六大正規化 Schema 與 Normalize 層（v2.1 §6）

## 目標
建立 `pkg/model/domain/` 六大共用正規化 Schema（TrendComposite / InstitutionalFlow / DividendRecord / FinancialHealthReport / RiskFlags / DerivativesSnapshot）與 `StockIdentity`；建立 `pkg/model/normalize/` 轉換層，定義各 Adapter → Schema 之 From&lt;Source&gt;() 介面並實作首批兩條完整路徑。

## 驗收標準
- [ ] `pkg/model/domain/`：StockIdentity + 六個 Schema，欄位與 v2.1 §6 一致（含 json tag、omitempty 規則）
- [ ] `pkg/model/normalize/`：定義 FromTWSEOpenAPI / FromTWSEWeb / FromMIS / FromTPEx / FromMOPS / FromTAIFEXOpenAPI / FromTAIFEXDownload 之轉換函式（或介面）簽名統一
- [ ] 至少實作 FromMIS → KlineBar（供盤中引擎）與 FromTWSEWeb → InstitutionalFlow 一條完整路徑，以 fixture 驅動
- [ ] normalize 層為唯一「知道上游原始欄位」之處；既有 pkg/provider 之 Normalize 輸出標記為相容層（deprecated 註解）或改為呼叫 normalize 層
- [ ] 單元測試：每 Schema JSON round-trip、StockIdentity 正確性、FromMIS / FromTWSEWeb 轉換正確（含單位換算驗證）

## 備註
- 前置：T021（domain Schema 之 `_lineage` 欄位型別依賴新 Lineage）
- 與 T023 / T026 / T027 相依：normalize 層先立骨架，Adapter 標註（T023）與 Tool 補齊（T027）時逐步填實
- 既有 pkg/model 中 v1.3 之 Normalized Models（Candle、KlineBar 等）保留不動，domain Schema 為其上層聚合結構
