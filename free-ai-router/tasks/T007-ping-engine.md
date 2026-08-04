---
github_issue:
title: Ping Engine (parallel pings, keep-alive, backoff, staleness guard)
type: pending
priority: high
status: done
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-03
updated: 2026-08-04
---

# T007 - Ping Engine

## 目標
Implement `internal/ping/engine.go` per spec §5 and §16. The ping engine continuously measures model latency by sending minimal chat completions (`max_tokens: 1`). Uses parallel goroutines, per-provider keep-alive transports, progressive backoff, and staleness guard.

## 驗收標準
- [x] `internal/ping/engine.go` with `pingAllOnce` parallel ping loop
- [x] Interval: every 2 seconds (configurable via W/X keys in TUI) (§5.2)
- [x] Concurrency: 64 concurrent initial pass, 20 concurrent steady state (§5.2, §23)
- [x] Timeout: 2.5s initial pass, 6s steady state (§5.2)
- [x] TTFB measurement: latency = time-to-first-byte (status code received), not full response time (§5.3, Requirement #6)
- [x] Keep-alive transport: shared `http.Transport` per provider host with `MaxIdleConns=200`, `MaxIdleConnsPerHost=100`, `IdleConnTimeout=90s` (§5.3, §23)
- [x] Connection pool isolation: per-provider-host transport (§5.3)
- [x] Response draining: bodies drained/closed immediately after reading status code (§5.3)
- [x] Progressive backoff: 3+ failures skip 1 round, 4+ skip 2, 5+ skip 4, 6+ skip 8, 7+ skip 16 (§5.4)
- [x] Staleness guard: epoch counter; old epoch results discarded on epoch bump (config reload, interval change) (§5.5)
- [x] History cap: 100 ping entries per model (§5.2)
- [x] `ping_test.go` with status mapping, backoff logic, staleness guard

## 備註
- Ping probes use HTTP status 200 as success, 401/403/429/404/5xx as various failure states (§3.5)
- Thread-safe: ping results applied under RWMutex (§16.3)
