---
github_issue: ""
title: Artifact Lock Tests
type: task
priority: high
status: pending
depends_on: ["T003", "T015", "T016"]
assignee: pi
created: 2026-09-03
updated: 2026-09-03
---

# T020 - Artifact Lock Tests

## 目標
驗證 Artifact Locking 機制，確保 locked 狀態下資料不可修改。

## 驗收標準
- [ ] 驗證 raw data 在 locked 狀態：UPDATE → FAIL, DELETE → FAIL
- [ ] 驗證 snapshot 在 LOCKED 狀態：UPDATE → FAIL, DELETE → FAIL
- [ ] 驗證 algorithm version 不可修改
- [ ] 驗證 valuation configuration 不可修改
- [ ] 驗證 GIS source metadata 不可修改
- [ ] 驗證 snapshot manifest 不可修改
- [ ] 測試涵蓋所有 P5 列舉的 artifact 類型

## 備註
- P5 Artifact Locking 核心要求
- Locked artifact 不得由一般 AI workflow 修改
- 測試需在資料庫層級驗證 constraint 生效