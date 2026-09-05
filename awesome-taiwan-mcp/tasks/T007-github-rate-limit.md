---
github_issue: N/A
title: GitHub Rate Limit — rate limiter, retry, 429 handling, timeout, context cancellation
assignee: pi with opencode
type: feat
priority: high
^status: done
depends_on: []
created: 2026-09-05
updated: 2026-09-05
---

# T007 - GitHub Rate Limit — rate limiter, retry, 429 handling, timeout, context cancellation

## 目標

實作成 GitHub API 的 rate limiting, retry with backoff, 429/5xx handling, 
timeout, and context cancellation. 對應 CRAWLER_AGENT_TASKS.md §9 TASK-007, §40 Rate Limit, §22 Retry Policy。

## 驗收標準

- [x] `RateLimitConfig` struct 實現 (§40): RequestsPerSecond (float64), Burst (int), MaxConcurrency (int)
- [x] GitHub adapter 使用 token bucket rate limiter (RequestsPerSecond=2, Burst=1 for GitHub unauthenticated)
- [x] HTTP 429 response → exponential backoff, 尊重 Retry-After header
- [x] HTTP 5xx response → retry with exponential backoff
- [x] HTTP 4xx response → 不重試 (除了 429)
- [x] Timeout → 重試 (network timeout)
- [x] DNS failure → 重試
- [x] Max retries = 3 (initial + 3 retries = 4 requests max, §TST-035)
- [x] Base delay = 1s, max delay = 30s (§22 Retry Policy)
- [x] Context cancellation 在所有 HTTP 請求中傳播
- [x] 429 不會造成 crawler crash (§TST-007 Task-007 Acceptance: 429 不會造成 crash)
- [x] 每次重試之間有 exponential backoff (1s → 2s → 4s → 8s, capped at 30s)
- [x] Retry-After header 為 0 或未設置時使用 exponential backoff
- [x] 每次請求有 timeout (<= 30s for API, <= 10s for MCP protocol)
- [x] 單元測試: mock 伺服器回傳 429 → backoff 發生, rate limit respected, no infinite retry (§TST-034)
- [x] 單元測試: mock 伺服器連續 5 次回傳 500 → 實際請求 <= 4 次 (§TST-035)

## 備註

- GitHub 獨立 rate limiter, 不影響其他 source (§41 Failure Isolation)
- Rate limiter 配置來自 `config/sources.yaml` (§50 Configuration)
- retry 配置: max_retry=3, base_delay=1s, max_delay=30s

## 執行紀錄（2026-09-05 稽核）
- 已達成: 依據最終驗證 (T045) 通過 build+test+vet+mod verify, 代碼在對應 internal/ 套件中實現, 測試覆蓋率達標
