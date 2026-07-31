---
github_issue: N/A
title: D/E 組基本面、篩選與股利工具
type: feature
priority: medium
status: pending
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-07-31
updated: 2026-07-31
---

# T014 - D/E 組工具（基本面・篩選・股利）

## 目標
註冊 §10.D（基本面與篩選）與 §10.E（股利）共 10 個工具，對接 T012 MOPS 與 T008 TWSE 資料；`get_financial_health_check` 之五面向評分邏輯由 T017 composite engine 提供。

## 驗收標準
- [ ] D 組：`get_financial_statements`、`get_monthly_revenue`、`get_valuation_ratios`（PE/PB/ROE/殖利率）、`get_esg_report`（TWSE OpenAPI）、`get_company_profile`、`screen_stocks`（value/growth 條件，T017 引擎）
- [ ] E 組：`get_dividend_history`（配息歷史 + 穩定性）、`get_exdividend_calendar`、`screen_high_yield`（T017 引擎）
- [ ] 各工具 schema 與 §10.D/E 一致；輸出含 `_lineage` 與 `_chart_meta`（如財報 radar、篩選 scatter，§11.3）
- [ ] TTL 依 §4.2：營收/財報 12h、除權息行事曆 L2 持久
- [ ] 契約測試 + 整合測試（股利為 0、財報缺期、篩選無結果之邊界）

## 備註
- 五面向（獲利/成長/結構/配息/治理）評分輸入來自本組工具之 raw 資料，勿在 T014 內重寫評分邏輯
- 篩選類工具必須整批透過快取 + 記憶體計算，避免逐股打上游（§12.4）
