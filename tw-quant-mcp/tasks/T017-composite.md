---
github_issue: N/A
title: 複合分析引擎（財報體檢 / 篩選）
type: feature
priority: medium
status: pending
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-07-31
updated: 2026-07-31
---

# T017 - Composite Engines

## 目標
實作 `pkg/engine/composite/`（§6 架構圖、§10.D）：`get_financial_health_check` 五面向評分、`screen_stocks` 價值/成長篩選、`screen_high_yield` 高殖利率排行；全部走快取 + 記憶體計算，不重複打上游（§12.4）。

## 驗收標準
- [ ] 五面向評分（獲利能力/成長性/財務結構/配息政策/公司治理）：每面向 0~100 分與總分，計算規則於 config 可調、輸出版本號
- [ ] 評分輸入僅依賴 T014 已快取之 raw 資料（財報/營收/估值/ESG/股利），禁止在引擎內直接呼叫 Adapter
- [ ] `screen_stocks`：value（低 PE/PB、高殖利率）與 growth（營收/獲利成長）條件組合、排序、`top_n` 限制
- [ ] `screen_high_yield`：min_yield 過濾、排行、配息穩定性（連年配息年數）
- [ ] 單元測試：評分計算正確性、條件組合、邊界（缺財報資料之個股跳過並註記）
- [ ] 整合測試：mock 驗證全流程對上游 Adapter 之呼叫次數 = 1（快取命中）

## 備註
- 引擎輸出為 helper 資料，`_lineage.source_role=helper` 且 `derived_from` 標明所有父資料集
- 評分規則為產品核心邏輯，版本化（scoring_version）並隨輸出回傳，便於日後回測
