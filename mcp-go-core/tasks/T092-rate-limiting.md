---
github_issue: N/A
title: P0 - Rate Limiting: Per-method token bucket rate limiter
type: feat
priority: high
status: done
depends_on:
  - T086
assignee: "pi with opencode"
created: 2026-09-04
updated: 2026-09-04
---

# T092 - Rate Limiting: Token Bucket Middleware

## 目標

Add per-method rate limiting via token bucket algorithm:
- `golang.org/x/time/rate` based limiter
- Per-method limits (tools/list, tools/call, prompts/get, etc.)
- Configurable per-method limits via `rateLimits` config section
- Returns proper JSON-RPC 2.0 error: code `-32402` (rate limit exceeded)
- Graceful fallback to reject-all if misconfigured

## 驗收標準
- [ ] `core/middleware/rate_limit.go`: `RateLimitMiddleware` with per-method limits
- [ ] Default limits: tools/call 30/sec, tools/list 10/sec, prompts/get 10/sec
- [ ] Configurable via YAML `rateLimits:` section
- [ ] JSON-RPC error response on limit exceeded (-32402)
- [ ] Health endpoint `/rate-limits` reports current bucket status
- [ ] 4 new tests: within-limit/burst/over-limit/per-method
- [ ] `go test -race ./... -count=1` all pass
- [ ] `go vet ./...` clean

## 備註
**Priority:** High — production DoS protection.

**Key files:** `core/middleware/rate_limit.go`, `core/config/`, `core/router/router.go` (middleware injection)

**Design:** Use `x/time/rate.Limiter` with `sync.Map` for thread-safe per-method storage. Middleware wraps `router.Dispatch`.

## 執行紀錄
- 2026-09-04: Created task, pending implementation
- 2026-09-04: Implemented core/middleware/ratelimit, Manager/Allow/Status, server.WithRateLimiter(), 8 tests. 43 pkgs -race PASS, 353 tests. Committed at d09f977.
