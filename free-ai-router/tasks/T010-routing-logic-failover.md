---
github_issue:
title: Routing Logic & Failover
type: pending
priority: high
status: done
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-03
updated: 2026-08-04
---

# T010 - Routing Logic & Failover

## 目標
Implement `internal/router/routing.go` per spec §7.3-7.6. Contains the model selection algorithm (QoS ranking) and automatic failover with sub-second retry. Implements model pinning and streaming support.

## 驗收標準
- [x] Request model parsing:
  - `auto-fastest` → best overall model (QoS-ranked)
  - `minimax-m2.5` → best model in that group across providers
  - `tag:coding` → best model with that tag
  - `provider/model-id` → exact match (with failover)
  - `<specific model id>` → match by group alias or exact ID
- [x] Eligibility filtering:
  - Must be `status: up` (not banned, disabled, excluded)
  - If coding-only enabled, must have `coding` tag
  - Must pass `minSweScore` floor if configured
  - Must not be in `bannedModels` list
- [x] QoS computation: `QoS = qualityScore × availabilityMultiplier(uptime) + pingTieBreaker` (§7.3)
- [x] Rank by QoS descending, pick top candidate
- [x] API key resolution: env var > config > multi-account pool rotation
- [x] Automatic failover: on 5xx/429/connection error:
  - Mark failed model/provider as rate-limited or down
  - Re-rank remaining eligible models
  - Retry with next-best model (up to `MAX_PROACTIVE_RETRIES = 5`)
  - 50ms backoff between attempts (§7.4, Requirement #6)
  - 429 accounts get 60-second cooldown
- [x] Connection reuse on failover: fresh keep-alive connection from pool; same host reuses connection; cross-provider uses per-host transport cache (§7.4)
- [x] Streaming support: pipe upstream SSE stream to client, capture TTFB/usage/tokens (§7.5)
- [x] Model pinning: canonical (group) and exact (provider+model) modes (§7.6)
- [x] 503 response if all models fail after retries (§17.2)

## 備註
- `router_proxy_test.go`: httptest mock upstream returns 200/429/500; verify failover (§13.2)
