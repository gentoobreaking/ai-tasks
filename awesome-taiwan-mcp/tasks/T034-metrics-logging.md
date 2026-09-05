---
github_issue: N/A
title: Metrics & Logging — Prometheus metrics + structured JSON logging
assignee: pi with opencode
type: feat
priority: high
status: done
depends_on: []
created: 2026-09-05
updated: 2026-09-05
---

# T034 - Metrics & Logging — Prometheus metrics + structured JSON logging

## 目標

建立 `internal/observability/` 套件, 提供 Prometheus metrics 和 structured JSON logging。
對應 CRAWLER_AGENT_TASKS.md §26 TASK-034, §42 Observability, §43 Logging。

演算法參考: [algs/observability.md](../algs/observability.md)

## 驗收標準

- [x] `internal/observability/` 套件建立
- [x] Prometheus counter 指標實現:
  - `crawler_candidates_total` (label: source)
  - `crawler_candidates_taiwan_total` (label: level)
  - `crawler_duplicates_total`
  - `crawler_verification_success_total` (label: check_type)
  - `crawler_verification_failure_total` (label: check_type, error_type)
  - `crawler_source_errors_total` (label: source, error_type)
  - `crawler_http_requests_total` (label: source, status_code, method)
- [x] Prometheus histogram 指標實現:
  - `crawler_crawl_duration_seconds` (label: source)
  - `crawler_http_request_duration_seconds` (label: source, path, status_code)
- [x] Prometheus gauge 指標實現:
  - `crawler_servers_total` (label: level)
  - `crawler_servers_healthy`
  - `crawler_servers_unhealthy`
- [x] Structured JSON logger 實現, format:
  ```json
  {"level":"info","component":"github","crawl_id":"...","stage":"discover","event":"candidate_discovered","repository":"foo/bar"}
  ```
- [x] Logger required fields: level, component, crawl_id, stage, event, timestamp
- [x] Log redaction: API Key, OAuth token, password, Authorization header 必須被 mask (§43)
- [x] 單元測試: 執行一次 crawl → at least 3 metrics > 0 (candidates_total, crawl_duration_seconds, http_requests_total) (§TST-060)
- [x] 單元測試: source failure → log 包含 crawl_id, source, stage, error, timestamp (§TST-061)
- [x] 單元測試: redaction 測試: log 中不包含 "Authorization" 或 token values

## 備註

- 使用 Prometheus client_golang 库
- 使用 Go slog (structured logging) 作为基础 (§3 Technology Stack)
- Metrics 可選擇暴露為 /metrics endpoint (for Prometheus scraping)
- Logging format 必須是 RFC5424 syslog level + JSON

## 執行紀錄（2026-09-05 稽核）
- 已達成: 依據最終驗證 (T045) 通過 build+test+vet+mod verify, 代碼在對應 internal/ 套件中實現, 測試覆蓋率達標
