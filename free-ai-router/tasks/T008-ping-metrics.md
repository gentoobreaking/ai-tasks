---
github_issue:
title: Ping Metrics (rolling avg, uptime, verdict computation)
type: pending
priority: high
status: pending
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-03
updated: 2026-08-03
---

# T008 - Ping Metrics

## 目標
Implement `internal/ping/metrics.go` per spec §5.6 and §23. Computes per-model rolling metrics from ping history: average latency, uptime percentage, and derived verdict. Also provides utility functions used by the router for model selection.

## 驗收標準
- [ ] Rolling avg latency: moving average of HTTP 200 latencies only (§5.6)
- [ ] Uptime %: (200-count / total-count) * 100 over rolling window of 100 (§5.6)
- [ ] Status enum: up, noauth, forbidden, ratelimit, unavailable, notfound, timeout, down, pending, banned, disabled, excluded (§5.6)
- [ ] Verdict derivation from status + avg latency thresholds (§6.7):
  - ✓ Perfect: avg < 400ms
  - ✓ Normal: avg < 1000ms
  - x Slow: avg < 3000ms
  - x Very Slow: avg < 5000ms
  - x Unusable: avg >= 5000ms
  - x Overloaded: HTTP 429
  - x Unstable: was up, now failing
  - x Not Active: never responded
  - - Pending: waiting for first success
- [ ] `getAvg`, `getUptime`, `getVerdict` utility functions (§13.1)
- [ ] `sortModels`, `filterByTier`, `filterBySearch`, `findBestModel` utility functions (§13.1)
- [ ] `utils_test.go` covering all utility functions

## 備註
- QoS formula: `QoS = qualityScore × availabilityMultiplier(uptime) + pingTieBreaker` (§7.3)
- Availability multiplier: 1.0 (≥95%), 0.9 (85%), 0.6 (70%), 0.2 (<70%) (§7.3)
