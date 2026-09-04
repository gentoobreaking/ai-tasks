---
github_issue: ""
title: Valuation Engine
type: task
priority: medium
status: done
updated: 2026-09-04
depends_on:
  - T014
  - T028
assignee: "pi with opencode"
created: 2026-09-03
updated: 2026-09-03
---

# T015 - Valuation Engine

## 目標
實作土地估值引擎，產出 bear/base/bull 三區間估值與 confidence。

## 驗收標準
- [x] 實作 Base Value：weighted median comparable unit price (對極端交易較穩健)
- [x] 實作 Valuation Range：bear_value (P25 adjusted), base_value (P50 adjusted), bull_value (P75 adjusted)
- [x] 實作 Confidence 等級：HIGH, MEDIUM, LOW, INSUFFICIENT
  - 依 comparable_count, area_similarity, distance, time_range, zoning_match, land_use_match, road_access_match 計算
- [x] 實作 Insufficient Data 處理：comparable_count < minimum_required 時回傳 INSUFFICIENT_DATA 狀態，不得硬算估值
- [x] 實作 Valuation Provenance 記錄：valuation_id, target_parcel, snapshot_id, comparable_ids, algorithm_version, configuration_version, outlier_method, weights, statistics, created_at
- [x] 相同 snapshot + 相同 config + 相同 algorithm → 相同 valuation (reproducible)
- [x] 單元測試與整合測試

## 備註
- v2.0 不做 LLM-based valuation，採 deterministic pipeline：Comparable → Filtering → Scoring → Statistics → Adjustment → Value range
- 不能為了讓 AI 有答案而製造答案
- Confidence 代表 Comparable 資料品質完整度，非 AI 信心度
- 建立 valuation_config 與 algorithm_version 管理