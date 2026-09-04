---
github_issue: ""
title: Transaction Service
type: task
priority: high
status: done
depends_on:
  - T008
  - T026
assignee: "pi with opencode"
created: 2026-09-03
updated: 2026-09-03
---

# T009 - Transaction Service

## 目標
實作 Transaction Service Layer，封裝業務邏輯，提供給 MCP Tool Layer 使用。

## 驗收標準
- [ ] 實作 TransactionService：SearchTransactions, GetTransaction, GetTransactionStatistics
- [ ] 輸入參數驗證與轉換 (避免 SQL injection，符合 AI Isolation)
- [ ] 回傳格式符合 MCP API 規格：包含 data, metadata(algorithm_version, snapshot_id, generated_at, query_hash), data_provenance
- [x] 查詢參數標準化：county, district, section, land_number, date_from, date_to
- [x] 統計計算：count, min, P10, P25, median, mean, P75, P90, max (價格/單價)
- [x] 單位統一：price_per_ping (1 坪 = 3.305785 平方公尺)
- [x] 單元測試與整合測試

## 備註
- MCP Tool Layer 只接受結構化參數，禁止接受 raw SQL/PostGIS expression
- 符合 AI Isolation 原則：AI 不得直接 SQL/GIS/valuation calculation
- Service layer 負責將結構化參數轉為 SQL 查詢