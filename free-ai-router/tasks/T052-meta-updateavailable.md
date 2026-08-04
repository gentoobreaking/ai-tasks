---
github_issue:
title: 'Fix: /api/meta updateAvailable is hardcoded false'
type: bugfix
priority: medium
status: done
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-04
updated: 2026-08-04
---

# T052 - Fix: real updateAvailable in /api/meta

## 目標
`handleAPIMeta` (`internal/router/server.go:233`) hardcodes `updateAvailable: false`. Wire the real `cli.CheckForUpdate` via a pluggable checker so router stays decoupled.

## 驗收標準
- [ ] `Server.SetUpdateChecker(fn func() (string, error))`; `handleAPIMeta` returns `{version, updateAvailable, updateUrl}` (updateUrl omitted when none)
- [ ] Check result cached (e.g. 30 min TTL) with singleflight so /api/meta never blocks on repeated network calls
- [ ] Network errors → `updateAvailable: false` (degraded, no error)
- [ ] main.go wires `cli.CheckForUpdate(false)`
- [ ] Unit test: fake checker returning a URL → updateAvailable true; returning error → false; cached (second call doesn't re-invoke checker)
- [ ] `go build`, `go test ./...` pass
