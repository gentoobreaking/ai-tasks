---
github_issue:
title: 'Fix: shouldSkip producer-side state mutation race'
type: bugfix
priority: high
status: done
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-04
updated: 2026-08-04
---

# T030 - Fix: shouldSkip backoff race

## 目標
Fix the P1 race where the ping loop producer calls `shouldSkip()` which mutates `m.SkippedRounds++` (`internal/ping/engine.go:219`) while ping worker goroutines write `m.SkippedRounds = 0` in `applyResult` on the same model — concurrent unsynchronized writes. Backoff state must live in the locked update path (see T029) or use atomic access.

## 驗收標準
- [ ] `shouldSkip` is side-effect free (pure function of current state)
- [ ] `SkippedRounds++` moved into the lock-protected `applyResult` / engine step (same critical section as T029)
- [ ] When a model is skipped, the counter increments exactly once per loop tick
- [ ] `-race` test combining `PingAllOnce` + concurrent `shouldSkip` calls reports zero races
- [ ] Existing ping backoff tests still pass (skip semantics unchanged)

## 備註
- 與 T029 同一 critical section，可合併實作但任務分開追蹤
