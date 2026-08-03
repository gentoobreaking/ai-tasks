---
github_issue:
title: Unit Tests
type: pending
priority: high
status: pending
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-03
updated: 2026-08-03
---

# T023 - Unit Tests

## 目標
Implement all unit test files per spec §13.1 using Go's standard `testing` package. Tests cover config I/O, utility functions, tags, model catalog, CLI parsing, and ping logic.

## 驗收標準
- [ ] `config_test.go`: Config load/save, normalizeConfigShape, legacy migration from `~/.free-router.json`
- [ ] `utils_test.go`: `getAvg`, `getUptime`, `getVerdict`, `sortModels`, `filterByTier`, `filterBySearch`, `findBestModel`
- [ ] `tags_test.go`: Tag normalization, `getModelTags`, `setModelTags`
- [ ] `models_test.go`: Model aliasing, canonicalization, quality score resolution
- [ ] `cli_test.go`: Arg parsing for all CLI flags and subcommands
- [ ] `ping_test.go`: Ping result status mapping, backoff logic, staleness guard
- [ ] All unit tests pass via `go test ./internal/... -short`

## 備註
- Use Go standard library `testing` package only (§13.1)
- Run with `go test -v ./...` for verbose output
