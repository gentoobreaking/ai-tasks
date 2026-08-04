---
github_issue:
title: 'Chore: remove dead code'
type: cleanup
priority: low
status: done
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-04
updated: 2026-08-04
---

# T055 - Cleanup: dead code removal

## 目標
Remove unused symbols (verified by grep, no references outside their own declaration):
- `Server.mu` (`internal/router/server.go`)
- `FallbackModel`, `PromptAddKey` (`internal/targets/common.go`)
- `FilterByTier`, `FilterByProvider`, `FilterBySearch`, `FindByGroup`, `canonicalizeID` (`internal/models/catalog.go`)
- `updateCheckInterval` (`internal/cli/update.go`)
- `EnvConfigPath` (`internal/cli/flags.go`)

Keep `--no-log` flag parsing (user-facing no-op, default is already no logging).

## 驗收標準
- [ ] All listed symbols removed; no compile/test breakage
- [ ] `go build`, `go vet`, `go test ./...` pass
