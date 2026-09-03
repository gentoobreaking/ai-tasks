---
github_issue: ""
title: GIS 匯入管線（Parcel / Road）
type: task
priority: high
status: pending
depends_on: ["T011"]
assignee: pi
created: 2026-09-03
updated: 2026-09-03
---

# T027 - GIS 匯入管線（Parcel / Road）

## 目標
補齊交易 CSV 之外的第二條官方資料管線：從國土測繪圖資服務雲 / 地籍圖資網路便民服務系統取得 Parcel 與 Road 官方圖資，完成 `4326→3826` 正規化、驗證、去重、批次匯入 `parcel/parcel_geometry/road_segment`，並建立 provenance 與 snapshot 關聯。

## 驗收標準
- [ ] 實作 `GISDownloader`：支援國土測繪圖資服務雲 WMS/WFS 與地籍圖資網路便民服務系統批次下載，含 `If-Modified-Since` / `ETag` 快取與重試
- [ ] 實作 `GISParser`：解析 GeoJSON / SHP / GML（含 Big5 屬性），欄位對應 `parcel_id, county, district, section, land_number, area_sqm, urban_zoning, land_use_category`
- [ ] 座標正規化：來源 `EPSG:4326` → 內部 `EPSG:3826`（`ST_Transform`），雙向驗證誤差 < 1cm；面積以 `ST_Area(3826)` 為準並與來源 `area_sqm` 交叉校驗（誤差 >5% 警告）
- [ ] 驗證：`geometry` 必為 `MultiPolygon`、無自相交（`ST_IsValid`）、`county+district+section+land_number` 四鍵齊全、面積 >0
- [ ] 去重：`UNIQUE(county, district, section, land_number, source_version)`，同一 `source_version` 內重複 geometry 去重並記錄 `import_batch_id`
- [ ] 匯入：批次 `BatchInsertParcels` / `BatchInsertRoadSegments`（`COPY` 或 `Batch`），支援 `road_segment` 含 `road_class, width, geometry(MultiLineString,3826)`
- [ ] Road 幾何匯入後建立 `GIST(geometry)` 索引並執行 `VACUUM ANALYZE`；提供 `parcel_geometry` 的 `centroid(ST_Centroid)` 與 `bbox(ST_Envelope)` 衍生欄位自動填充
- [ ] Provenance：每筆 `parcel_geometry` / `road_segment` 寫入 `source, source_version, snapshot_id, import_batch_id`，可追回原始下載檔 `checksum` 與 `downloaded_at`
- [ ] Snapshot 關聯：GIS 匯入批次建立 `dataset_snapshot`（source=`NLSC_GIS`），狀態 `LOCKED` 後觸發 GIS 鎖定（由 T020 驗證）
- [ ] 端到端測試：提供 `testdata/gis_sample.geojson`（含竹篙灣段 2 筆 parcel + 1 筆 road）→ 匯入 → PostGIS 內 `ST_Area` / `ST_DWithin` 驗證通過
- [ ] 錯誤處理：下載失敗 / `ST_IsValid=false` / 座標越界 → 單筆跳過 + 錯誤分類計數，不中斷整批

## 備註
- 對應 GIS_SPEC.md §4.2-4.5，本任務是 `T011 Geometry Engine` 的資料來源，必須在 `T012 Road Access Engine` 之前完成
- Google Maps 僅作視覺化（T022），禁止將本任務以外的圖資當作 `OFFICIAL` road width（見 §4.8-4.9）
- 下游依賴：`T012` 需新增 `depends_on: T027`（已在本次重接處理）
