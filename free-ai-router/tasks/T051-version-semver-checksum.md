---
github_issue:
title: 'Fix: VERSION resolution, semver compare, checksum verify'
type: bugfix
priority: medium
status: done
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-04
updated: 2026-08-04
---

# T051 - Fix: version & update robustness

## 目標
1. `loadVersion()` (`internal/cli/flags.go:217-227`) reads `VERSION` from the CWD — an installed binary run from another directory reports v0.1.0, breaking version + update checks.
2. Update version comparison is string equality (`v0.9` vs `v0.10` compares wrong).
3. Downloaded binary is replaced with no integrity check.

## 驗收標準
- [ ] `loadVersion()` tries `<exe-dir>/VERSION` first, then CWD `VERSION`, then default
- [ ] `parseSemver`/`versionNewer` numeric compare; `CheckForUpdate` returns update only when latest is newer (not merely different)
- [ ] `applyUpdate` verifies SHA256 when `FREMODEL_UPDATE_SHA256` is set (error on mismatch); prints computed sha when not set
- [ ] `http.Get` in update paths uses a client with a timeout
- [ ] Unit tests: versionNewer (v0.9<v0.10, equal, older), checksum match/mismatch
- [ ] `go build`, `go test ./...` pass
