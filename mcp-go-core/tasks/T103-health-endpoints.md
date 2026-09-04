---
github_issue: N/A
title: P1 - Health Endpoints: HTTP health check routes for features, rate-limits, config
type: feat
priority: medium
status: pending
depends_on:
  - T091
  - T092
  - T090
assignee: "pi with opencode"
created: 2026-09-05
updated: 2026-09-05
---

# T103 - Health Endpoints: HTTP Health Check Routes

## 目標
Implement HTTP health check endpoints to expose feature flag status, rate limiter state, and config load status. These endpoints are referenced in T091 and T092 acceptance criteria but were deferred because the server has no HTTP health route registration:
- `GET /health/features` — returns all feature flags and their status
- `GET /health/features/<name>` — returns status of a specific flag
- `GET /health/rate-limits` — returns current token bucket status per method
- `GET /health/config` — returns config load timestamp + last error
- `GET /health` — server overall health (basic liveness check)

## 驗收標準
- [ ] HTTP transport (`modules/transport/http/`, `modules/transport/sse/`) registers health routes alongside `/mcp`
- [ ] `GET /health/features` returns JSON: `{"flags": {"flag_name": true/false, ...}}`
- [ ] `GET /health/features/<name>` returns 200/404 for flag status
- [ ] `GET /health/rate-limits` returns JSON: `{"limits": [{"method": "tools/call", "rate": 30, "burst": 30, "available": 25}]}`
- [ ] `GET /health/config` returns JSON: `{"path": "...", "lastLoaded": "2026-...", "lastError": null}`
- [ ] `GET /health` returns 200 with `{"status": "ok", "version": "0.1.0"}`
- [ ] Health route registration is optional (only enabled if `WithHealth(true)` option is passed)
- [ ] 5 tests: features list, feature detail (found/not found), rate-limits, config, basic health
- [ ] `go test -race ./... -count=1` all pass
- [ ] `go vet ./...` no errors

## 備註
**Context**: Discovered during task-audit of T091 and T092. Both tasks specified health endpoints (`/features/<name>`, `/rate-limits`) but the codebase has no HTTP health route registration — the server only registers `/mcp` for JSON-RPC message handling on HTTP transport. The `MarshalFlagStatus` helper exists in featurewire but is never wired to a route.

**Key Files**:
- `modules/transport/http/transport.go` — add health route registration
- `core/server/server.go` — add health option + route registration callback
- `core/server/builder.go` — add `WithHealth(bool)` builder option
- `core/middleware/featurewire/featurewire.go` — expose `MarshalFlagStatus` for HTTP handler
- `core/middleware/ratelimit/ratelimit.go` — expose `Status()` output for HTTP handler

**Design Decision**: Health endpoints are registered on the HTTP transport alongside `/mcp`. SSE transport may also need health endpoints for load balancer probing. The server provides a `RegisterHealthRoutes` callback that the transport invokes.
