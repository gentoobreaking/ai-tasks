---
github_issue: N/A
title: P2 - Tracing Middleware Module (Deferred - External Condition)
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

# T072 - P2: Tracing Middleware Module

## 目標

建立 `modules/middleware/tracing/` 和 `modules/observability/tracing/`，實現 distributed tracing。

對應 feature_graph_spec F34, architecture §25 Observability API, §66 Non-Goals, agent_tasks TASK-042。

## 驗收標準

- [x] `Tracer` interface 提供 spans with context
- [x] Request tracing middleware
- [x] Tracing module 不得 import metrics 或 OAuth
- [x] Core 不得直接依賴 OpenTelemetry
- [x] `go test ./modules/middleware/tracing/... ./modules/observability/tracing/...` 成功

## 備註

Reflection prohibited in hot path。Tracing is deferred for v0.1. Core must not depend on OpenTelemetry directly.

## 執行紀錄 (2026-09-04 稽核)
- 已達成 4 項並打勾。
- **未竟事項**: 無
