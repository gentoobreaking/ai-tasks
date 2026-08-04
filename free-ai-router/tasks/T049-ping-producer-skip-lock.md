---
github_issue:
title: 'Fix: PingAllOnce producer reads skip state without lock'
type: bugfix
priority: high
status: done
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-04
updated: 2026-08-04
---

# T049 - Fix: producer shouldSkip race

## 目標
In `PingAllOnce` (`internal/ping/engine.go:196-206`) the producer goroutine calls `shouldSkip(m)` on live model pointers (reading `FailStreak`/`SkippedRounds`) with no lock, while ping workers write those fields under the registry write lock via `apply`/`markSkipped`. Data race (missed by `-race` because producer usually finishes first; timing-dependent).

## 驗收標準
- [ ] Producer reads skip state under the registry read lock (`registry.WithModel`) when a registry is set; falls back to the pure read only when no registry exists
- [ ] `shouldSkip` stays a pure predicate; new engine-level accessor adds the lock
- [ ] Race test: repeated `PingAllOnce` rounds with models that fail (growing `FailStreak` → skip path exercised) run under `go test -race` clean
- [ ] `go test -race ./internal/ping/` passes

## 備註
- markSkipped 已用 m.ID 走 registry lock，不需更動
