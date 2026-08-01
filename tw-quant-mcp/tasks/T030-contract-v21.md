---
github_issue: N/A
title: v2.1 版契約測試與全量回歸（v2.1 §6 / §14）
type: testing
priority: medium
status: pending
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-01
updated: 2026-08-01
---

# T030 - v2.1 版契約測試與全量回歸

## 目標
為 v2.1 升級補齊契約測試：每個 Adapter 之 Normalize 輸出符合 §6 正規化 Schema（欄位型別/單位/日期）；Lineage / Cache / Chart 欄位一致性（v2.1 §13 Phase 6 測試項目）；全量 36 工具回歸。產出 v2.1 需求對照表（§14）核對。

## 驗收標準
- [ ] 七個 Adapter 各至少一個契約測試：驗證 Normalize 輸出型別/單位/日期符合 §6（錄製回放 golden fixtures）
- [ ] 全量 36 工具之 Lineage / Cache / Chart 欄位一致性測試（freshness / source_role / grade / cache_age_sec 正確）
- [ ] 全量工具回歸：`go test ./...` 全數通過（含 T021–T029 新增測試）
- [ ] v2.1 §14 需求對照表核對：7 項優化需求 + 10 情境 + 25 Tool 逐條勾稽，產出 traceability 文件（放 README 或 docs/）
- [ ] 壓測：20 併發同熱門股查詢，Single-flight / 快取命中率 ≥ 80%（沿用 v1.3 §13 目標）

## 備註
- 前置：T021–T029 完成後執行
- 此為 v2.1 收尾驗證任務，類似 v1.3 之 T019；完成後接 T031 發布
