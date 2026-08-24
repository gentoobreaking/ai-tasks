---
github_issue: N/A
title: webhook 接收：認證、冪等、正規化
type: feat
priority: high
status: done
depends_on:
- T001
assignee: "pi with opencode/x-preview-f-free"
created: 2026-08-24
updated: 2026-08-24
---

# T002 - webhook 接收：認證、冪等、正規化

## 目標
`ingest/`：AlertManager webhook 接收端點。**實作依據：`algs/integrity-auth.md` §E.1–E.2 全部。**

## 驗收標準
- [x] §E.1：shared secret 強制驗證，不符回 401 並計入 /metrics；未认证請求不得消耗任何下游資源
- [x] §E.2：(fingerprint, status) 冪等鍵——同鍵重送回上次結果，不新建 Incident 不重跑管線；spec.md §5 標準 13 的重送 3 次案例測試
- [x] AM payload → IncidentEvent 正規化有表驅動測試（含缺欄位容錯）
- [x] payload 大小上限與 rate limiting（防灌爆）

## 執行紀錄（2026-08-24 稽核）
- 已達成 4 項並打勾。
- **未竟事項**：無。
- 補充（證據）：ingest_test.go：TestAuth_RejectsAndCounts（401＋metrics＋core.calls==0）、TestIdempotency_ResendThreeTimesSingleIncident（重送 3 次僅 1 次 core 呼叫，§5 標準 13）、TestNormalize_TableDriven 9 案例、TestPayloadTooLarge（413）、TestRateLimit_PerIP（429）；另 e2e test_std13 以跨 process HTTP 重送驗證同結論。
