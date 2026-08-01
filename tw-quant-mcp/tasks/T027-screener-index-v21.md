---
github_issue: N/A
title: Materialized Screener Index 與批次效能（v2.1 §10）
type: feature
priority: medium
status: pending
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-01
updated: 2026-08-01
---

# T027 - Materialized Screener Index 與批次效能（v2.1 §10）

## 目標
實作 v2.1 §10 效能層：批次端點優先原則落實於既有篩選類工具；Bounded Worker Pool（errgroup.SetLimit，併發 = RATE_LIMIT_BULK_CONCURRENCY）；每日收盤後（15:00）預計算 Materialized Screener Index 寫入 SQLite（L2），篩選工具直接讀索引不即時運算。

## 驗收標準
- [ ] §10.1：既有篩選類工具（screen_stocks / screen_high_yield / get_abnormal_trading 等）確認優先使用全市場批次端點（TWSE Web API 收盤行情、TPEx 批次），無逐檔 2,000 次呼叫路徑（grep / 測試驗證）
- [ ] §10.2：`pkg/domain/screener/` 實作 ScanUniverse（errgroup.SetLimit，併發數對應 RATE_LIMIT_BULK_CONCURRENCY=8），用於無批次端點之逐檔情境（如財報體檢）
- [ ] §10.3：Materialized Index 排程（每交易日 15:00）計算 DividendRecord / FinancialHealthReport.OverallScore / ValuationRatios 快照入 SQLite；`screen_high_dividend_yield` 改為直接 `SELECT ... ORDER BY dividend_yield_pct DESC LIMIT ?`，零即時 Adapter 請求
- [ ] `_lineage.freshness` 標註索引建立時間而非查詢當下（誠實反映資料新鮮度）
- [ ] 新增測試：index 建立/查詢、非交易日不重算、freshness 標註、ScanUniverse 併發上限（mock 逐檔 fn）

## 備註
- 前置：T024（L2）、T026（domain/screener 目錄）、T025（RATE_LIMIT_BULK_CONCURRENCY）
- v2.1 §10.3 排程時機 15:00 早於 v1.3 §12.9 預熱 16:45：兩者併存（15:00 index、16:45 盤後預熱），於 prewarm.go 整合排程
- 此為 v2.1 相對 v1.3 最大新增功能，優先度建議高
