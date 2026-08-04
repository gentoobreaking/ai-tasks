---
github_issue:
title: 'Fix: Failover retry policy (only 429/5xx/conn errors)'
type: bugfix
priority: high
status: done
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-04
updated: 2026-08-04
---

# T032 - Fix: Failover retry policy

## 目標
Fix the P1 bug where `ServeChatCompletions` retries and marks models `down` on non-retryable statuses (401/403/404). Per spec §7.4, failover applies only to 429, 5xx, and connection errors. Non-retryable upstream responses must be returned to the client as-is. Also remove the unreachable `status >= 500` dead-code block.

## 驗收標準
- [ ] `forward()` distinguishes retryable (429, ≥500, network error) vs non-retryable (401/403/404/400) responses
- [ ] Non-retryable responses are proxied to the client verbatim (status + body) without failover
- [ ] Retryable failures trigger next-best model with 50ms backoff (per spec §7.4)
- [ ] 429 marks 60s cooldown; 5xx marks model down — unchanged
- [ ] Dead `status >= 500` block removed
- [ ] Tests: 401 returns 401 to client without retry; 429/500 failover to next model; 503 after all retries exhausted

## 備註
- 50ms backoff 目前未實作（重試迴圈無 delay）— 需在本次補上
