---
github_issue: N/A
title: REST API — HTTP API for registry search + metadata (Phase 4)
assignee: pi with opencode
type: feat
priority: medium
status: done
depends_on: []
depends_of: []
blocked: false
blocked_on: []
created: 2026-09-05
updated: 2026-09-06
---

# T048 - REST API — HTTP API for registry search + metadata

## Goal

建立 REST API server。對應 CRAWLER_AGENT_TASKS.md §48 TASK-048, §48 REST API, §67 MVP Scope Phase 4。

## Acceptance Criteria

- [x] `cmd/api/` 目錄建立, Go HTTP server (standard library)
- [x] `GET /health` and `GET /api/v1/health` → `{"status":"ok","timestamp":"...","version":"v0.1","db_count":N}`
- [x] `GET /api/v1/servers` → 回傳所有 MCP server views (支援 pagination, filtering)
- [x] `GET /api/v1/servers/{id}` → 回傳單一 server 詳細資料; 404 if not found
- [x] `GET /api/v1/search?q=keyword` → 支援關鍵字搜索, level, category, status, security, min-score 過濾
- [x] `GET /api/v1/registry` → 回傳 registry data (schema_version, total_servers, taiwan_relevant, statistics, servers)
- [x] `GET /api/v1/statistics` → 回傳 statistics (total_servers, taiwan_relevant, by_level, by_health, quality_distribution, by_status)
- [x] `GET /api/v1/health` → 回傳 health.json 內容
- [x] API 回應格式: pagination (page, limit, total, total_pages)
- [x] API 支援 rate limiting (100 req/min/IP)
- [x] API CORS header (Access-Control-Allow-Origin: *)
- [x] HTTP method validation (405 for non-GET)
- [x] API 單元測試: 13 test cases covering all endpoints, pagination, filters, method validation
- [x] API integration test: full query flow with test server, CORS headers, search filters

## Implementation

- `internal/api/server.go`: HTTP handlers, rate limiter, CORS middleware
- `internal/api/ratelimiter.go`: sliding-window rate limiter with background cleanup
- `cmd/api/main.go`: CLI entrypoint with flags for port, db path, rate limit, timeouts
- `internal/api/api_test.go`: Unit tests for all handlers
- `internal/api/integration_test.go`: Integration tests with httptest.Server
- `Dockerfile.multi`: Multi-stage build with `runtime-api` target
- `docker-compose.yaml`: API service mapped to port 8080

## Notes

- v0.1 originally excluded REST API (§67 MVP Scope: Phase 4) — unblocked per user request
- REST API depends on Search Engine (T036) and Registry Export (T028) — both complete
- Uses Go standard library `net/http`, no external framework
