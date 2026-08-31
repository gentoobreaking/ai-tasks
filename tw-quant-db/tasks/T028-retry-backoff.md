---
id: T028
project: tw-quant-db
assignee: "pi"
priority: medium
type: implementation
status: done
depends_on: [T026]
github_issue: https://github.com/gentoobreaking/ai-tasks/issues/65
created: 2026-08-31
updated: 2026-08-31
---

# T028 - Retry + Backoff

## 目標
實作 spec §5.3 的 Switch Triggers 與 Retry Logic。

## 驗收標準
- [x] `fetchWithFallback` retry loop (max 2 retries per source)
- [x] `RateLimitExceeded` → retry with 60s backoff
- [x] `ConnectionError/Timeout` → retry up to 2 times with 10s delay
- [x] `NoDataReturned` → switch to next source immediately
- [x] `IncompleteData` (coverage < 70%) → switch to next source immediately
- [x] Every source switch logged with reason (spec §10: "Logs every source switch with reason")

## 備註
- spec §5.3 Switch Triggers table 明確 4 種 error type 的 action
- retry/backoff logic in `fetchWithFallback`
