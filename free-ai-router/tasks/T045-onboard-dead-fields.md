---
github_issue:
title: 'Fix: onboard misleading message + dead fields'
type: cleanup
priority: low
status: done
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-04
updated: 2026-08-04
---

# T045 - Fix: onboard message + dead code

## 目標
1. `RunOnboard` (`internal/cli/onboard.go:86`) prints "Starting TUI..." but no TUI starts — misleading.
2. Dead fields: `Router.modelGroups` (`internal/router/routing.go:29,54`), `MaxBackoffSkipRounds` (`internal/ping/engine.go:20`) — remove.

## 驗收標準
- [ ] onboard final message is accurate (e.g. "Configuration saved to ...")
- [ ] `modelGroups` removed from Router struct + constructor
- [ ] `MaxBackoffSkipRounds` removed
- [ ] `go build`, `go vet`, `go test ./...` pass

## 備註
- skipRoundsFor 上限 16 為常數內文，不需標示
