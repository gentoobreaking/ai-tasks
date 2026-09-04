---
github_issue: ""
title: CSV Parser Implementation
type: task
priority: high
status: done
depends_on:
  - T004
assignee: "pi with opencode"
created: 2026-09-03
updated: 2026-09-03
---

# T005 - CSV Parser Implementation

## 目標
實作官方 CSV 檔案解析器，處理編碼、欄位名稱對應、日期、價格、面積、地段、地號、使用分區、使用地類別等欄位。

## 驗收標準
- [x] 實作 CSV Parser (支援 Big5/UTF-8 編碼自動偵測)
- [x] 正確解析 MANIFEST.CSV, schema-main.csv, schema-build.csv, schema-land.csv
- [x] 處理欄位名稱標準化 (中文欄位名 → 英文代碼)
- [x] 日期格式標準化 (民國年 → 西元年)
- [x] 價格、面積數值型別轉換與驗證
- [x] 地段、地號、使用分區、使用地類別代碼對應
- [x] 已知樣本資料集 → 預期 normalized records 測試通過

## 備註
- 此為 Phase 3 第一步：Parser
- 後續接 Normalizer 與 Validator
- 注意官方資料編碼可能為 Big5