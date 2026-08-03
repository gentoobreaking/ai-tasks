---
github_issue:
title: Routing Logic & Failover
type: pending
priority: high
status: pending
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-03
updated: 2026-08-03
---

# T010 - Routing Logic & Failover

## 目標
Implement `internal/router/routing.go` per spec §7.3-7.6. Contains the model selection algorithm (QoS ranking) and automatic failover with sub-second retry. Implements model pinning and streaming support.

## 驗收標準
- [ ] Request model parsing:
  - `auto-fastest` → best overall model (QoS-ranked)
  - `minimax-m2.5` → best model in that group across providers
  - `tag:coding` → best model with that tag
  - `provider/model-id` → exact match (with failover)
  - `<specific model id>` → match by group alias or exact ID
- [ ] Eligibility filtering:
  - Must be `status: up` (not banned, disabled, excluded)
  - If coding-only enabled, must have `coding` tag
  - Must pass `minSweScore` floor if configured
  - Must not be in `bannedModels` list
- [ ] QoS computation: `QoS = qualityScore × availabilityMultiplier(uptime) + pingTieBreaker` (§7.3)
- [ ] Rank by QoS descending, pick top candidate
- [ ] API key resolution: env var > config > multi-account pool rotation
- [ ] Automatic failover: on 5xx/429/connection error:
  - Mark failed model/provider as rate-limited or down
  - Re-rank remaining eligible models
  - Retry with next-best model (up to `MAX_PROACTIVE_RETRIES = 5`)
  - 50ms backoff between attempts (§7.4, Requirement #6)
  - 429 accounts get 60-second cooldown
- [ ] Connection reuse on failover: fresh keep-alive connection from pool; same host reuses connection; cross-provider uses per-host transport cache (§7.4)
- [ ] Streaming support: pipe upstream SSE stream to client, capture TTFB/usage/tokens (§7.5)
- [ ] Model pinning: canonical (group) and exact (provider+model) modes (§7.6)
- [ ] 503 response if all models fail after retries (§17.2)

## 備註
- `router_proxy_test.go`: httptest mock upstream returns 200/429/500; verify failover (§13.2)
