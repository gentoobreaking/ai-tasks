---
github_issue: ""
title: Observability Implementation
type: task
priority: medium
status: pending
depends_on: ["T017", "T023"]
assignee: pi
created: 2026-09-03
updated: 2026-09-03
---

# T024 - Observability Implementation

## 目標
實作完整的可觀測性：Metrics、Logs、Tracing。

## 驗收標準
- [ ] 實作 Metrics (Prometheus)：
  - mcp_requests_total, mcp_request_duration_seconds
  - transaction_query_total, transaction_query_duration
  - gis_query_total, gis_query_duration
  - comparable_query_total, valuation_query_total
  - data_import_total, data_import_errors
  - snapshot_locked_total
- [ ] 實作 Logs 必須包含：request_id, tool_name, snapshot_id, algorithm_version, query_hash
- [ ] 整合 OpenTelemetry Tracing
- [ ] Grafana Dashboard 範例
- [ ] Alert rules 範例 (高錯誤率、高延遲、匯入失敗)

## 備註
- Phase 17 Observability
- 所有關鍵操作需有完整追蹤能力
- Log 格式統一為 JSON 便於分析