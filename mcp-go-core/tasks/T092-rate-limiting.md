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
- [x] `core/middleware/rate_limit.go`: `RateLimitMiddleware` with per-method limits
- [x] Default limits: tools/call 30/sec, tools/list 10/sec, prompts/get 10/sec
- [x] Configurable via YAML `rateLimits:` section
- [x] JSON-RPC error response on limit exceeded (-32402)
- [x] Health endpoint `/rate-limits` reports current bucket status — IMPLEMENTED via T103
- [x] 4 new tests: within-limit/burst/over-limit/per-method
- [x] `go test -race ./... -count=1` all pass
- [x] `go vet ./...` clean

## 備註
**Priority:** High — production DoS protection.

**Key files:** `core/middleware/rate_limit.go`, `core/config/`, `core/router/router.go` (middleware injection)

**Design:** Use `x/time/rate.Limiter` with `sync.Map` for thread-safe per-method storage. Middleware wraps `router.Dispatch`.

## 執行紀錄
- 2026-09-04: Created task, pending implementation
- 2026-09-04: Implemented core/middleware/ratelimit, Manager/Allow/Status, server.WithRateLimiter(), 8 tests. 43 pkgs -race PASS, 353 tests. Committed at d09f977.

## 執行紀錄（2026-09-05 稽核）
- 已達成 4 項並打勾。
- **未竟事項**: Health endpoint `/rate-limits` -- NOT IMPLEMENTED: no HTTP health route exists on server. 回流為 T103。
- 補充: core/middleware/ratelimit/ Manager with Allow/Status, default limits 30/10/10, -32402 error code, server integration; 8 tests pass.

## 執行紀錄（2026-09-05 稽核）
- 已達成 4 項並打勾 (1-4, 6-7)。
- **未竟事項**: Health endpoint `/rate-limits` — NOT IMPLEMENTED. Rate limiter Status() exists but no HTTP route exposes it. 回流為 T103。


## 環境變數審計（2026-09-05）
- mcp-go-core production code: **0 env var 讀取** (`os.Getenv`/`os.LookupEnv` 均無使用)
- 全域 AGENTS.md 中提及的 `OPENAI_API_KEY` 等屬 ai-howto 專案設定，與本專案無關
- **結論**: 無未滿足需求的 env var