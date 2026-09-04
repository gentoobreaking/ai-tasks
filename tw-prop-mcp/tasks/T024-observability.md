---
github_issue: ""
title: Observability Implementation
type: task
priority: medium
status: done
depends_on:
  - T017
  - T023
assignee: "pi with opencode"
created: 2026-09-03
updated: 2026-09-03
---

# T024 - Observability Implementation

## 目標
實作完整的可觀測性：Metrics、Logs、Tracing。

## 驗收標準
- [x] 實作 Metrics (Prometheus)：
  - mcp_requests_total, mcp_request_duration_seconds
  - transaction_query_total, transaction_query_duration
  - gis_query_total, gis_query_duration
  - comparable_query_total, valuation_query_total
  - data_import_total, data_import_errors
  - snapshot_locked_total
- [x] 實作 Logs 必須包含：request_id, tool_name, snapshot_id, algorithm_version, query_hash
- [x] 整合 OpenTelemetry Tracing
- [x] Grafana Dashboard 範例
- [x] Alert rules 範例 (高錯誤率、高延遲、匯入失敗)

## 執行紀錄（2026-09-04 稽核）
- 已達成 5 項並打勾。
- 實作證據：
  - Metrics: `internal/mcp/observability.go` 13 個 Prometheus metric variables，測試 `TestIncTransactionQuery`、`TestIncGISQuery`、`TestIncComparableQuery`、`TestIncValuationQuery`、`TestIncDataImport`、`TestIncSnapshotLocked`
  - Logs: `RequestLogEntry` struct with `request_id, tool_name, snapshot_id, algorithm_version, query_hash` fields，測試 `TestRequestLogEntry_JSON`、`TestLogEntryContainsRequiredFields`
  - Tracing: `StartTrace`/`EndTrace` using `otel.Tracer("tw-prop-mcp/mcp")`，測試 `TestStartTrace_CreatesSpan`、`TestEndTrace_WithError`
  - Grafana: `deploy/monitoring/grafana-dashboard.json` (12 panels)
  - Alert rules: `deploy/monitoring/alert-rules.yaml` (10 rules)
- **未竟事項**: 無
- 補充: 所有 15 個 MCP tool handler 已透過 `instrument()` wrapper 加入 metrics + tracing