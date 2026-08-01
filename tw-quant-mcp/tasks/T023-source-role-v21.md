---
github_issue: N/A
title: 七來源 Source Role 分級落地（v2.1 §3）
type: refactor
priority: medium
status: pending
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-01
updated: 2026-08-01
---

# T023 - 七來源 Source Role 分級落地（v2.1 §3）

## 目標
將現有七個 Adapter 依 v2.1 §3 表標註 source_role：TWSE OpenAPI / TWSE Web API / TPEx / MOPS / TAIFEX OpenAPI = CANONICAL；TWSE MIS = SEMI_OFFICIAL_REALTIME；TAIFEX 網站下載 = FALLBACK。落實「優先 CANONICAL、不足時降級 FALLBACK 並在 `_lineage` 反映實際使用來源」之設計規則。

## 驗收標準
- [ ] 七個 Adapter 之 lineage `source_role` 皆正確標註（以測試或 grep 驗證無遺漏、無舊值 canonical/helper）
- [ ] TAIFEX 歷史回溯（taifex_dl.go）路徑確認：date == 最新交易日走 openapi（CANONICAL），否則走下載頁（FALLBACK），`_lineage.source_role` 如實反映實際使用來源
- [ ] MIS 路徑僅供 §8 盤中引擎使用（SEMI_OFFICIAL_REALTIME）；其他 domain 模組不得以 MIS 為資料來源（code review / 測試守門）
- [ ] 既有 36 工具全數通過契約測試（輸出無未轉換之原始欄位，配合 T022 normalize 層）
- [ ] 新增測試：fallback 路徑之 lineage 標註正確（mock 最新日 vs 歷史日兩種情境）

## 備註
- 前置：T021、T022
- v1.3 的 helper 角色（VWAP / 技術指標等派生計算）不屬來源分級：派生計算歸 domain 層（T026）業務邏輯，Lineage 不再需要 derived_from
- 參考 v2.1 §3 設計規則（降級須反映於 lineage）與 §4 設計規則 2（多來源聚合 → []Lineage）
