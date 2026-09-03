---
github_issue: ""
title: Data Import Pipeline Integration
type: task
priority: high
status: pending
depends_on: ["T004", "T005", "T006", "T007", "T008"]
assignee: pi
created: 2026-09-03
updated: 2026-09-03
---

# T026 - Data Import Pipeline Integration

## 目標
整合完整資料匯入管線：Downloader → Parser → Normalizer → Validator → Deduplicate → Import → Snapshot Lock。

## 驗收標準
- [ ] 整合 Downloader + Parser + Normalizer + Validator 完整流程
- [ ] 實作 Deduplicate：同一 snapshot 內 source_record_hash 去重
- [ ] 實作 Import：批次寫入 transaction, transaction_land, transaction_building, parcel
- [ ] 實作 Snapshot Lock：import 完成後自動鎖定 snapshot
- [ ] 端到端測試：官方測試資料 → 完整管線 → 資料庫驗證
- [ ] 錯誤處理：任一階段失敗可重試、snapshot 狀態正確轉換
- [ ] 匯入效能基準測試
- [ ] 監控指標：data_import_total, data_import_errors

## 備註
- 整合 Phase 2, 3, 4 的所有組件
- Pipeline: Download → Checksum → Raw Archive → Parse → Normalize → Validate → Deduplicate → Import → Snapshot Lock
- 此任務確保資料從官方來源到資料庫的完整鏈路通順