---
github_issue: ""
title: Transaction Repository
type: task
priority: high
status: pending
depends_on: ["T007"]
assignee: pi
created: 2026-09-03
updated: 2026-09-03
---

# T008 - Transaction Repository

## 目標
實作 Transaction Repository Layer，使用 sqlc 生成型別安全的 SQL 查詢，支援交易資料的批次匯入與查詢。

## 驗收標準
- [ ] 定義 SQL 查詢檔 (sql/transaction.sql)
- [ ] 使用 sqlc 生成 Go 代碼
- [ ] 實作 TransactionRepository interface 與實作
- [ ] 批次匯入：BatchInsertTransactions (支援大量資料高效寫入)
- [ ] 查詢：GetByID, Search (依縣市、鄉鎮、段、地號、日期範圍)
- [ ] 統計查詢：GetStatistics (count, min, max, mean, percentiles)
- [ ] 所有 SQL 必須經 sqlc，禁止 dynamic SQL from AI
- [ ] Repository 測試：使用 testcontainers 或測試資料庫
- [ ] 查詢結果 deterministic (相同輸入 → 相同輸出)

## 備註
- 不使用 ORM，採用 pgx + sqlc
- SQL 可明確控制、PostGIS 支援完整、query 可 version control
- 禁止 AI 直接接觸 SQL，由 service layer 轉換參數