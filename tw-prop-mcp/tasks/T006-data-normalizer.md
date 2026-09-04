---
github_issue: ""
title: Data Normalizer
type: task
priority: high
status: done
depends_on:
  - T005
assignee: "pi with opencode"
created: 2026-09-03
updated: 2026-09-03
---

# T006 - Data Normalizer

## 目標
實作資料正規化器，將解析後的原始資料轉換為標準化的 transaction、parcel 實體。

## 驗收標準
- [x] 實作 Normalizer：raw CSV rows → Transaction/Parcel domain objects
- [x] 交易資料正規化：統一欄位格式、單位轉換 (坪↔平方公尺)、代碼標準化
- [x] 地號標準化：county + district + section + land_number 組合鍵
- [x] 面積單位統一：1 坪 = 3.305785 平方公尺
- [x] 建物資訊正規化：類型、樓層、屋齡、車位
- [x] 任何 normalization 都建立新的 artifact，原始資料不修改
- [x] 已知樣本資料集 → 預期 normalized records 測試通過

## 備註
- 遵循 P2 Raw Data Immutable：任何 normalization 都建立新的 artifact
- Transaction 核心欄位：transaction_id, snapshot_id, transaction_date, transaction_type, county, district, section, land_number, transaction_target, total_price, unit_price, land_area_sqm, building_area_sqm, urban_zoning, non_urban_zoning, land_use_category, building_type, floor, age, parking_area, parking_price, source_record_hash
- Parcel 核心欄位：parcel_id, county, district, section, land_number, area_sqm, urban_zoning, land_use_category, geometry, centroid, source, source_version