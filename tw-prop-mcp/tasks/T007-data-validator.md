---
github_issue: ""
title: Data Validator
type: task
priority: high
status: done
depends_on:
  - T006
assignee: "pi with opencode"
created: 2026-09-03
updated: 2026-09-03
---

# T007 - Data Validator

## 目標
實作資料驗證器，確保正規化後的資料符合業務規則與資料庫約束。

## 驗收標準
- [x] 實作 Validator：檢查必要欄位、資料型別、數值範圍、外鍵關聯
- [x] 必要欄位驗證：transaction_id, parcel_id, county, district, section, land_number 等
- [x] 數值範圍驗證：價格 > 0、面積 > 0、屋齡 >= 0 等
- [x] 日期邏輯驗證：交易日期不得晚於今天、不得早於合理下限
- [x] 地號唯一性：county + district + section + land_number 組合不得只依 land_number 判斷
- [x] 重複資料偵測：同一 snapshot 內 source_record_hash 唯一
- [x] 驗證錯誤分類與詳細錯誤訊息
- [x] 單元測試覆蓋各種正常/異常案例

## 備註
- 此為 Phase 3 最後一步：Validator
- 防止同一 snapshot 重複 import：UNIQUE (snapshot_id, source_record_hash)
- 驗證通過後才能進入 Import 階段