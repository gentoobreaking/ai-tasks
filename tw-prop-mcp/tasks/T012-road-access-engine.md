---
github_issue: ""
title: Road Access Engine
type: task
priority: high
status: pending
depends_on: ["T011", "T027"]
assignee: pi
created: 2026-09-03
updated: 2026-09-03
---

# T012 - Road Access Engine

## 目標
實作道路臨接判定引擎，包含最近道路查詢、距離計算、臨路判定、道路寬度取得。

## 驗收標準
- [ ] 實作 Road Segment 模型與 Repository (road_id, name, road_class, width, geometry, source, source_version)
- [ ] 實作 ParcelRoadAccess 模型 (parcel_id, road_id, distance_m, nearest_point, road_width_m, access_type, source, algorithm_version)
- [ ] 實作最近道路查詢：ST_DWithin + ST_Distance
- [ ] 實作臨路判定演算法：
  - ROAD_ADJACENT：土地邊界與道路 geometry 直接接觸或在 tolerance 內
  - ROAD_NEARBY：道路在指定距離內但無法證明直接臨路
  - NO_ROAD_DETECTED：搜尋範圍內無道路
  - UNKNOWN：GIS 來源不足
- [ ] 道路寬度來源分類：OFFICIAL, GIS_DERIVED, UNKNOWN
- [ ] 四種 case (ROAD_ADJACENT, ROAD_NEARBY, NO_ROAD_DETECTED, UNKNOWN) 皆有測試案例
- [ ] 禁止從衛星圖「猜」道路寬度當成官方資料

## 備註
- 臨路判定不能只靠 distance < X，需 parcel boundary + road geometry + distance + intersection
- Google Maps 不作為 official cadastral source，僅供 visualization/satellite context/street view
- Street View 只提供 visual verification，不得直接轉成 official road width