---
github_issue: ""
title: GIS Adapter & Geometry Engine
type: task
priority: high
status: done
depends_on: ["T010"]
assignee: pi
created: 2026-09-03
updated: 2026-09-03
---

# T011 - GIS Adapter & Geometry Engine

## 目標
實作 GIS Adapter 介接官方圖資來源，以及 Geometry Engine 提供空間運算功能。

## 驗收標準
- [ ] 實作 GIS Adapter 介面 (支援國土測繪圖資服務雲、地籍圖資網路便民服務系統)
- [ ] 實作 Geometry 正規化：官方座標系 (EPSG:4326) → 內部 EPSG:3826
- [ ] 實作 Geometry Engine：ST_Intersects, ST_Within, ST_Contains, ST_Distance, ST_DWithin, ST_Area, ST_Centroid
- [ ] 所有大量 spatial query 必須由 PostGIS 執行，禁止在 Go memory 計算
- [ ] 已知地號 → 正確 geometry、centroid、面積測試通過
- [x] 座標轉換雙向測試：4326 ↔ 3826

## 備註
- GIS 架構：Official GIS → GIS Adapter → Normalize Geometry → PostGIS → Parcel/Road/Zoning/POI
- 系統內部統一 EPSG:3826 (適合台灣距離計算)
- 禁止：SELECT all geometry → Go memory → calculate distance