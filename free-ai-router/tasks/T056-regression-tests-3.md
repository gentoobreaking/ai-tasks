---
github_issue:
title: 'Tests: regression coverage for round-3 fixes'
type: test
priority: medium
status: done
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-04
updated: 2026-08-04
---

# T056 - Tests: round-3 regression coverage

## 目標
Regression tests for T048-T055 fixes.

## 驗收標準
- [ ] T048: `handleSignal(SIGWINCH)` → resize (renderPending set, quit false); `handleSignal(SIGINT)` → quit
- [ ] T049: race test — repeated `PingAllOnce` with failing models (skip path) passes `-race`
- [ ] T050: engine not started when `AutoPingEnabled=false`; API toggle starts/stops engine
- [ ] T051: `versionNewer` matrix (v0.9<v0.10, equal, older); sha256 verify match/mismatch; exe-dir VERSION precedence
- [ ] T052: fake checker → updateAvailable true/error→false; cached (single checker invocation across repeated GET)
- [ ] T053: concurrent `/api/config` GET+POST under `-race`
- [ ] T054: env key not persisted by add-key; remove-key on missing config key errors
- [ ] Full suite: `go test -race ./...` green; `gofmt -l` clean
