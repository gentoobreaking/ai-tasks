---
github_issue: N/A
title: 資料新鮮度守門（Freshness Gate）
type: feature
priority: high
status: pending
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-07-31
updated: 2026-07-31
---

# T003 - 資料新鮮度守門

## 目標
實作 §3：以 `_lineage` 判定資料可用性之守門層，含降級狀態機（NORMAL / STALE / DEGRADED / LOCKOUT）與守門事件日誌。

## 驗收標準
- [ ] §3.1 判定規則全數實作：盤中 `freshness == REALTIME_INTRADAY` 且 `fetched_at` 距今 ≤ `DATA_STALENESS_MAX_SEC`（預設 30s）；快取容許規則（sampling_sec ≤ 10、cache_ttl ≤ 4s）；盤前 `POST_MARKET_TODAY`；歷史 `HISTORICAL` + data_date 覆蓋
- [ ] §3.2 降級狀態機：STALE（單標的逾時→該標的停訊）、DEGRADED（市場層資料逾時→停發新訊僅管持倉）、LOCKOUT（連 3 次失敗或連線中斷→全系統停訊）
- [ ] 未知 `_lineage.source` 視同守門失敗（附錄 A）
- [ ] 守門結果寫入事件日誌：`freshness_gate_pass|fail`（含 cause、symbol、lag_sec）
- [ ] 單元測試：每種降級狀態之轉移、時間邊界（29s/31s）、快取規則組合

## 備註
- 守門是「決策前最後一道防線」，所有盤中訊號判定必須先通過（§1 核心原則 2）
- 降級行為需對 T009 盤中循環與 T008 Risk Manager 暴露一致之狀態 API
