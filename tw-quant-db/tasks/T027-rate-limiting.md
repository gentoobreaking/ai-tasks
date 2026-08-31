---
id: T027
project: tw-quant-db
assignee: "pi"
priority: medium
type: implementation
status: done
depends_on: [T021]
github_issue: https://github.com/gentoobreaking/ai-tasks/issues/65
created: 2026-08-31
updated: 2026-08-31
---

# T027 - Rate Limiting

## 目標
實作 spec §6 的 rate limiting 策略，避免觸發上游 API 限制。

## 驗收標準
- [x] Max batch size: 5 consecutive trading days (`splitIntoBatches` with batchSize=5)
- [x] Inter-batch delay: Random 2–5s (`randomDelay` function)
- [x] Per-source daily limit config: local-mcp=unlimited, twse-online=100/day, finmind=50/day, yfinance=30/min
- [x] yfinance-mcp 30 req/min sliding window via token bucket (configurable via `RATE_LIMIT_YFINANCE` env)

## 備註
- spec §6 明確 per-source limits
- yfinance 30 req/min sliding window 需 token bucket algorithm
