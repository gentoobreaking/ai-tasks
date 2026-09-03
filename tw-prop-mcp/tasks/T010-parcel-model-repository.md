---
github_issue: ""
title: Parcel Model & Repository
type: task
priority: high
status: done
depends_on: ["T002"]
assignee: pi
created: 2026-09-03
updated: 2026-09-03
---

# T010 - Parcel Model & Repository

## 目標
實作 Parcel 領域模型、Repository 以及基礎查詢功能。

## 驗收標準
- [x] 實作 Parcel domain model (parcel_id, county, district, section, land_number, area_sqm, urban_zoning, land_use_category, geometry, centroid, source, source_version)
- [x] 實作 ParcelRepository (sqlc 生成)
- [x] CRUD：Create, GetByID, GetByLandNumber (county+district+section+land_number), Search
- [x] Geometry 欄位：geometry(MultiPolygon, 3826)，centroid, bbox, area_sqm
- [x] 座標系統：內部 EPSG:3826，對外 API 可輸出 EPSG:4326
- [x] 單元測試與整合測試

## 備註
- Parcel 獨立於 Transaction，來源為官方地籍圖資
- Geometry 由 PostGIS 管理，禁止 SELECT all geometry → Go memory → calculate
- 土地地號唯一性：county + district + section + land_number 組合