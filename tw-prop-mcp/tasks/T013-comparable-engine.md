---
github_issue: ""
title: Comparable Engine
type: task
priority: high
status: done
depends_on:
  - T009
  - T010
  - T012
  - T028
assignee: "pi with opencode"
created: 2026-09-03
updated: 2026-09-03
---

# T013 - Comparable Engine

## 目標
實作 Comparable 交易篩選與評分引擎，包含 hard filters、多維度評分、總分計算。

## 驗收標準
- [x] 實作 Hard Filters：same county, same district, same section (必要時 same zoning, same land-use)
- [x] 實作 Area Similarity：area_ratio = candidate_area / target_area, area_difference = |candidate - target| / target，預設 <= 30% 可配置
- [x] 實作 Time Weight：time_score = exp(-lambda * age_months)，lambda 由 valuation_config 固定
- [x] 實作 Spatial Weight：distance_score = exp(-distance / distance_scale)，distance_scale 由配置決定
- [x] 實作 Zoning Match：same_zoning = 1, different_zoning = 0
- [x] 實作 Land Use Match：same_land_use = 1, different_land_use = 0
- [x] 實作 Road Access Match：相同 access_type = 1，不同則降低分數
- [x] 實作 Total Score：加權總和 (W_area, W_distance, W_time, W_zoning, W_land_use, W_road)，權重存在 valuation_config
- [x] 給定固定 snapshot：query → fixed comparable list → fixed scores (deterministic)
- [x] 單元測試覆蓋各評分維度、整合測試驗證 deterministic

## 備註
- 權重必須存在於 valuation_config，不得 hard-code
- Comparable 結果包含：transaction_id, distance_m, area_similarity, zoning_match, land_use_match, road_access_match, time_score, total_score
- algorithm_version 記錄於結果中