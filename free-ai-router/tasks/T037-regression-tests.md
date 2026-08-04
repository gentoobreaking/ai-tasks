---
github_issue:
title: 'Test: Regression suite for review fixes (race + e2e proxy + failover)'
type: test
priority: medium
status: done
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-04
updated: 2026-08-04
---

# T037 - Test: Regression suite

## 目標
Add regression tests that the existing suite missed, per review: the tests passed because they never exercised the concurrent ping+TUI path or the model-rewrite path. Each fix task (T026-T036) may bring its own tests; this task consolidates cross-cutting ones and verifies the full suite under `-race`.

## 驗收標準
- [ ] E2E proxy test: client → router → mock upstream; assert upstream receives rewritten `model` ID for `auto-fastest`, group alias, `tag:coding` (§7.3 step 6)
- [ ] Race test: `PingAllOnce` concurrent with registry reads/writes under `-race` — zero reports (covers T029/T030)
- [ ] TUI integration: input parser handles focus events (covers T031)
- [ ] Failover matrix: 401 (no retry) / 429 (retry + 60s cooldown) / 500 (retry + down) / connection error (retry) (covers T032)
- [ ] `go test -race ./...` passes for the entire module
- [ ] `go vet ./...` clean

## 備註
- Mock upstream = httptest.Server 記錄 request body
