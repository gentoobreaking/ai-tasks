---
github_issue: N/A
title: Prometheus 查詢來源層 internal/query
type: feat
priority: high
status: done
depends_on:
- T001
assignee: "pi with opencode/x-preview-f-free"
created: 2026-08-24
updated: 2026-08-24
---

# T003 - Prometheus 查詢來源層 internal/query

## 目標
`internal/query`：Source interface（InstantQuery / RangeQuery）+ Prometheus HTTP API 實作
+ 測試用 fake Source。所有下游模組只依賴 interface。

## 驗收標準
- [x] InstantQuery / RangeQuery 支援逾時與重試（指數退避，上限 3 次）
- [x] fake Source 可注入任意序列資料，供 budget/waste 測試使用
- [x] HTTP 錯誤分類：可重試（5xx/逾時）vs 不可重試（4xx），行為有測試

## 備註
- 後續 billing adapter 的 BillingSource interface 設計比照本模式（見 algs/cost-forecast.md §D.1）