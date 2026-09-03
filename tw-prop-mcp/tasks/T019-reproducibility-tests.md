---
github_issue: ""
title: Reproducibility Tests
type: task
priority: high
status: pending
depends_on: ["T017", "T018"]
assignee: pi
created: 2026-09-03
updated: 2026-09-03
---

# T019 - Reproducibility Tests

## 目標
實作 v2.0 核心的可重現性測試，驗證相同查詢在相同條件下產生相同結果。

## 驗收標準
- [ ] 執行 Query A → 取得 result hash = X
- [ ] 重新執行 Query A → 必須 result hash = X
- [ ] 測試涵蓋：Transaction 查詢、Parcel 查詢、Comparable 查詢、GIS 查詢、Valuation 查詢
- [ ] 驗證 query_hash 機制正確性
- [ ] 測試不同 snapshot 版本下的查詢結果差異可預期
- [ ] 自動化測試腳本可在 CI/CD 執行

## 備註
- 這是 v2.0 的核心測試 (Phase 12)
- Deterministic First 原則的直接驗證
- 相同 dataset snapshot + query parameters + algorithm version + configuration → 必須產生相同結果