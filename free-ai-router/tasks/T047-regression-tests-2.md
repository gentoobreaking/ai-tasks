---
github_issue:
title: 'Tests: regression tests for round-2 fixes'
type: test
priority: medium
status: done
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-04
updated: 2026-08-04
---

# T047 - Tests: round-2 regression coverage

## 目標
Regression tests for T038-T046 fixes.

## 驗收標準
- [ ] TUI: `navigate()` honors `ScrollSortPauseMs` (construct TUI directly, assert `pauseUntil` ≈ configured)
- [ ] `copyHeaders` strips hop-by-hop headers (Connection/Keep-Alive/Transfer-Encoding + `Connection: X-Foo` naming case)
- [ ] `rewriteModel` rejects non-object body
- [ ] DataDir(): source dir in dev + `FREMODEL_DATA_DIR` env override
- [ ] API: /api/models/ping against httptest upstream (up + fail cases)
- [ ] API: /api/providers/<key> discovery merge adds a model to registry
- [ ] API: /api/account-status lists providers from config
- [ ] Full suite: `go test -race ./...` green
- [ ] `gofmt -l` clean

## 備註
- 沿用現有 routing_regression_test.go 的 httptest 模式
