---
github_issue: N/A
title: Retry & Backoff — unified retry logic, context cancellation
assignee: pi with opencode
type: feat
priority: high
status: done
depends_on: []
created: 2026-09-05
updated: 2026-09-05
---

# T033 - Retry & Backoff — unified retry logic, context cancellation

## 目標

建立統一的 retry/backoff 機制, 供所有 network adapter 使用。
對應 CRAWLER_AGENT_TASKS.md §25 TASK-033, §22 Retry Policy, §43 Implementation Plan。

## 驗收標準

- [x] `internal/http/` 或 `internal/retry/` 套件建立
- [x] `RetryConfig` struct 實現 (§22): MaxRetries (int, default=3), BaseDelay (time.Duration, default=1s), MaxDelay (time.Duration, default=30s)
- [x] `RetryableHTTPClient` struct 實現, 內建 retry + backoff + rate limiter
- [x] HTTP 429 → exponential backoff, 尊重 Retry-After header
- [x] HTTP 5xx → exponential backoff retry
- [x] HTTP 4xx → 不重試 (除了 429)
- [x] Timeout → retry
- [x] DNS failure → retry
- [x] Max retries = 3 (initial + 3 retries = 4 requests max, §TST-035)
- [x] Exponential backoff: 1s → 2s → 4s → 8s, capped at MaxDelay (30s)
- [x] Context cancellation 在所有 retry loop 中檢查和傳播
- [x] `Retry(ctx context.Context, fn func() error) error` 函數實現
- [x] 每個 adapter 使用統一 retry, 不自行實作 (§TASK-033: 不要每個 adapter 自己重新實作)
- [x] 單元測試: mock server 回傳 429 → backoff 發生, rate limit respected (§TST-034)
- [x] 單元測試: mock server 連續 500 ×5, max_retry=3 → 實際請求 <= 4 次 (§TST-035)
- [x] 單元測試: context cancelled during retry → 立即停止, 返回 context error

## 備註

- Retry-After header 解析: 如果為 0 或未設置, 使用 exponential backoff
- Rate limiter: token bucket algorithm
- GitHub adapter 使用此 retry 客戶端 (T006, T007)

## 執行紀錄（2026-09-05 稽核）
- 已達成: 依據最終驗證 (T045) 通過 build+test+vet+mod verify, 代碼在對應 internal/ 套件中實現, 測試覆蓋率達標
