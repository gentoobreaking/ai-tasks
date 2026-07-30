---
github_issue: ""
title: "[Phase 1] 規則引擎 — 條件組合與訊號觸發"
type: feature
priority: high
status: done
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-07-30
updated: 2026-07-30
---

# T003 - 規則引擎

## 目標
實作 if-then 規則引擎，將特徵條件組合成可執行的訊號規則，輸出偏多／偏空／中性訊號，並支援每天自動產出。

對應規格：`§3.1.4 規則示例`

## 驗收標準
- [x] 支援條件組合（AND / OR 邏輯）— `all` / `any`
- [x] 規則至少 5–10 條 — 30 條（偏空 10 / 偏多 10 / 中性 10）
- [x] 每條規則含明確觸發條件、歷史統計結果、失效條件 — `conditions` + `failure_condition` + `compute_rule_stats`
- [x] 規則可透過設定檔（JSON/YAML）動態調整 — `configs/rules_{bearish,bullish,neutral}.yaml`
- [x] 每日可自動產出訊號結果並記錄 — pipeline 整合

## 備註
- 規則參數由回測結果決定，上線前須通過方法論檢核（§3.1.7）
- 所有規則須可人工解釋
