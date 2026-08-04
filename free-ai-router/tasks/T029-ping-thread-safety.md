---
github_issue:
title: 'Fix: Ping result thread safety (registry lock)'
type: bugfix
priority: high
status: pending
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-04
updated: 2026-08-04
---

# T029 - Fix: Ping/TUI thread safety

## 目標
Fix the P1 data race where ping worker goroutines mutate `*models.Model` fields (`Pings`, `AvgLatency`, `Uptime`, `Status`, `HTTPCode`, `FailStreak`) in `applyResult` while the TUI render loop and router read the same structs concurrently. Per spec §16.3, ping results must be applied under the registry write lock; config reads are lock-free.

## 驗收標準
- [ ] `models.Registry` gains `Lock()/RLock()/Unlock()/RUnlock()` helpers (or an explicit `UpdateModel(fn)` API)
- [ ] Ping engine applies results under the registry lock (add `registry *Registry` to `ping.Engine`)
- [ ] `shouldSkip` no longer mutates model state from the producer goroutine; backoff state moves into the locked update path
- [ ] Router model selection reads remain RLock-protected
- [ ] New race test: run `PingAllOnce` concurrently with registry reads via `-race` — zero reports
- [ ] Existing tests pass

## 備註
- 避免持鎖過久：applyResult 內只做 memcpy 等級操作
- Ping history cap (100) 仍在鎖內執行
