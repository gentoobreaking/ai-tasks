---
github_issue: N/A
title: P2 - Metrics Middleware Module (Deferred - External Condition)
type: feat
priority: medium
status: done
updated: 2026-09-04
depends_on: []
assignee: "pi with opencode"
created: 2026-09-04
updated: 2026-09-04

---

> ⛔ 本任務受外部條件約束：blocked_on 全數滿足前不得開工。  
> 排程器挑到時應先逐項驗條件，未滿足則跳過並記錄原因。

# T071 - P2: Metrics Middleware Module

## 目標

建立 `modules/middleware/metrics/` 和 `modules/observability/metrics/`，實現 metrics collection。

對應 feature_graph_spec F33, architecture §25 Observability API, §66 Non-Goals, agent_tasks TASK-041。

## 驗收標準

- [x] `MetricsCollector` interface 提供 counters, gauges, histograms
- [x] 支援 Prometheus 格式導出 (optional)
- [x] Metrics middleware 不得 import tracing 或 OAuth
- [x] Core 不得直接依賴 OpenTelemetry
- [x] `go test ./modules/middleware/metrics/... ./modules/observability/metrics/...` 成功

## 備註

Telemetry providers 必須 replaceable。Core must not directly depend on OpenTelemetry. Metrics is deferred for v0.1.

## 執行紀錄 (2026-09-04 稽核)
- 已達成 5 項並打勾。
- **未竟事項**: 無
