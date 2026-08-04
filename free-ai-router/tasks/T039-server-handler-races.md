---
github_issue:
title: 'Fix: lock-free reads after UpdateModel in ban/tags handlers'
type: bugfix
priority: high
status: done
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-04
updated: 2026-08-04
---

# T039 - Fix: server handler races (ban/tags)

## 目標
Fix the race where `handleAPIModelsBan` reads `m.Banned` after `registry.UpdateModel` without the registry lock (`internal/router/server.go:291`) and `handleAPIModelsTags` reads `m.Tags` after `UpdateModel` — concurrent POSTs race on unsynchronized reads. Capture the resulting value inside the locked `UpdateModel` closure.

## 驗收標準
- [ ] `handleAPIModelsBan` captures `banned` inside the `UpdateModel` closure and responds from it
- [ ] `handleAPIModelsTags` captures `tags` inside the closure and responds from it
- [ ] No lock-free reads of mutated fields in either handler
- [ ] `go test -race ./internal/router/` passes
- [ ] Existing ban/tags API behavior unchanged (tests pass)

## 備註
- 404 檢查仍可在 Get()（RLock 內）完成
