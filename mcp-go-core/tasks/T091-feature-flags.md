---
github_issue: N/A
title: P0 - Feature Flags: Runtime toggle system with config-backed flags
type: feat
priority: high
status: done
depends_on:
  - T007
assignee: "pi with opencode"
created: 2026-09-04
updated: 2026-09-04
---

# T091 - Feature Flags: Runtime Toggles

## 目標

Implement a runtime feature flag system:
- Config-backed flags (YAML `features:` section)
- Per-flag health endpoint `/features/<name>` 
- Flag evaluation with fallback/default support
- Integration with router dispatch (early exit on disabled flags)

## 驗收標準
- [ ] `core/feature/flag.go`: `Flags` struct with `Get`, `Set`, `IsDisabled`
- [ ] Config includes `features:` map
- [ ] Middleware `FeatureFlagMiddleware` gates tool/resource/prompt methods
- [ ] Health endpoint reports per-flag status
- [ ] 4 new tests covering enable/disable/gate/health
- [ ] `go test -race ./... -count=1` all pass
- [ ] `go vet ./...` clean

## 備註
**Priority:** High — production safety net for emergency rollbacks.

**Key files:** `core/feature/` (new), `core/middleware/`, `core/config/`, `core/server/`

## 執行紀錄
- 2026-09-04: Created task, pending implementation
- 2026-09-04: Implemented core/feature, featurewire middleware, server integration. 42 pkgs -race PASS, 345 tests. Committed at 8cbab1e.
