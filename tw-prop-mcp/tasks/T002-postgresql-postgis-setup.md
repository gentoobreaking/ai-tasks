---
github_issue: ""
title: PostgreSQL + PostGIS Setup
type: task
priority: high
status: done
depends_on: ["T001"]
assignee: pi
created: 2026-09-03
updated: 2026-09-03
---

# T002 - PostgreSQL + PostGIS Setup

## 目標
建立 PostgreSQL + PostGIS 環境、migration framework、sqlc 配置，並建立全部 11 張核心資料表 schema（含 PostGIS 擴充與座標系）。本任務僅負責 DDL 與基礎設施；Repository / Service 邏輯由下游任務實作（T003 snapshot 鎖定、T008 transaction、T010 parcel、T027 GIS 匯入、T028 algorithm/config、T029 result 持久化）。

## 驗收標準
- [ ] PostgreSQL 16 + PostGIS 3.x 環境就緒（Docker Compose，container_name 明確，healthcheck）
- [ ] 啟用擴充：`CREATE EXTENSION postgis; CREATE EXTENSION pgcrypto;`
- [ ] Migration framework 就緒（golang-migrate / goose擇一，Makefile 含 `migrate-up / migrate-down`，sqlc 生成納入 CI）
- [ ] sqlc 配置完成（`sqlc.yaml` 指向 `sql/` + `internal/repository/db`，`sqlc generate` 無錯誤，`pgx/v5` 為 driver）
- [ ] 建立 `dataset_snapshot` 表：id(PK), source, source_version, downloaded_at, published_at, file_name, file_sha256, record_count, status(PENDING/IMPORTING/LOCKED/FAILED), schema_version, import_started_at, import_completed_at
- [ ] 建立 `import_batch` 表：id(PK), snapshot_id(FK), started_at, completed_at, status, record_count, error_message
- [ ] 建立 `transaction` / `transaction_land` / `transaction_building` 三表：含 snapshot_id(FK), source_record_hash, transaction_date, county/district/section/land_number, total_price, unit_price, land_area_sqm, building_area_sqm, urban_zoning, non_urban_zoning, land_use_category, building_type, floor, age, parking_area, parking_price
- [ ] 建立 `parcel` / `parcel_geometry` 表：parcel_id(PK), county/district/section/land_number, area_sqm, urban_zoning, land_use_category, geometry geometry(MultiPolygon,3826), centroid geometry(Point,3826), bbox geometry(Polygon,3826), source, source_version
- [ ] 建立 `road_segment` 表：road_id(PK), name, road_class, width, geometry geometry(MultiLineString,3826), source, source_version
- [ ] 建立 `parcel_road_access` 表：parcel_id(FK), road_id(FK), distance_m, nearest_point geometry(Point,3826), road_width_m, access_type(ROAD_ADJACENT/ROAD_NEARBY/NO_ROAD_DETECTED/UNKNOWN), source, algorithm_version
- [ ] 建立 `comparable_result` 表：id(PK), target_parcel_id, candidate_transaction_id, distance_m, area_similarity, zoning_match, land_use_match, road_access_match, time_score, total_score, algorithm_version, created_at
- [ ] 建立 `valuation_result` 表：id(PK), target_parcel_id, snapshot_id(FK), comparable_ids(JSONB), algorithm_version, configuration_version, outlier_method, weights(JSONB), statistics(JSONB), bear_value, base_value, bull_value, confidence(HIGH/MEDIUM/LOW/INSUFFICIENT), status, created_at
- [ ] 建立 `algorithm_version` 表：version(PK), name, description, weights(JSONB), created_at；建立 `configuration_snapshot` 表：id(PK), version, config(JSONB), created_at（供 T028 版本化與鎖定）
- [ ] 座標系統：內部統一 EPSG:3826，API 層可輸出 EPSG:4326；migration 包含 `ST_Transform` 測試資料驗證 4326↔3826 雙向誤差 < 1cm
- [ ] Constraints：`UNIQUE(snapshot_id, source_record_hash)` 防重複 import；`UNIQUE(county, district, section, land_number, snapshot_id)` 地號複合唯一；`CHECK(price>0, area>0, age>=0)`；`CHECK(ST_SRID(geometry)=3826)`；FK 全部 `ON DELETE RESTRICT`
- [ ] Indexes：`GIST(geometry)`, `GIST(centroid)`, `GIN(comparable_ids)`, `BTREE(county, district, section)`, `BTREE(transaction_date)`, `BTREE(snapshot_id)`
- [ ] Migration up/down 可反覆執行（`make migrate-up && make migrate-down && make migrate-up` 通過）
- [ ] Schema 測試：逐表 `SELECT` + `pg_constraint` + `geometry_columns` 校驗
- [ ] Constraint 測試：重複 `(snapshot_id, source_record_hash)` → 失敗；僅 `land_number` 相同但 `section` 不同 → 允許；`SRID≠3826` 寫入 → 失敗

## 備註
- 不使用 ORM，採用 pgx + sqlc；SQL 檔集中 `sql/` 並納版控
- 本任務產出的 DDL 由 T028（algorithm/config 鎖定觸發器）與 T029（result repository）直接複用，不重建表
- 座標系錯誤是 GIS 計算系統性偏差根因，必須在 migration 層級強制