---
github_issue:
title: Unit Tests
type: pending
priority: high
status: done
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-03
updated: 2026-08-04
---

# T023 - Unit Tests

## 目標
Implement all unit test files per spec §13.1 using Go's standard `testing` package. Tests cover config I/O, utility functions, tags, model catalog, CLI parsing, and ping logic.

## 驗收標準
- [x] `config_test.go`: Config load/save, normalizeConfigShape, legacy migration from `~/.free-router.json`
- [x] `utils_test.go`: `getAvg`, `getUptime`, `getVerdict`, `sortModels`, `filterByTier`, `filterBySearch`, `findBestModel`
- [x] `tags_test.go`: Tag normalization, `getModelTags`, `setModelTags`
- [x] `models_test.go`: Model aliasing, canonicalization, quality score resolution
- [x] `cli_test.go`: Arg parsing for all CLI flags and subcommands
- [x] `ping_test.go`: Ping result status mapping, backoff logic, staleness guard
- [x] All unit tests pass via `go test ./internal/... -short`

## 備註
- Use Go standard library `testing` package only (§13.1)
- Run with `go test -v ./...` for verbose output
