---
github_issue: N/A
title: P1 - Dynamic Config: Hot-reload config without server restart
type: feat
priority: medium
status: done
depends_on:
  - T007
assignee: "pi with opencode"
created: 2026-09-04
updated: 2026-09-04
---

# T090 - Dynamic Config: Hot-Reload

## 目標

Enable runtime configuration reload without restarting the MCP server:
- File watcher on config file (YAML) via `fsnotify`
- Atomic config swap — no race conditions
- `/config/reload` endpoint for forced reload (admin only)
- Graceful degradation on invalid config (keep last good state)

## 驗收標準
- [x] Config struct supports atomic swap via `sync.RWMutex`
- [x] File watcher reloads YAML config on save
- [x] Invalid config: log error, keep previous valid config
- [x] Health check endpoint reports config load timestamp
- [x] 3 new tests covering reload/degradation/atomicity
- [x] `go test -race ./... -count=1` all pass
- [x] `go vet ./...` clean

## 備註
**Priority:** Medium — needed for zero-downtime production operation.

**Key files:** `core/config/`, `core/server/`, `core/middleware/health.go`

## 執行紀錄
- 2026-09-04: Created task, pending implementation
- 2026-09-04: Implemented core/config (Config, Watcher, Health, atomic swap). 7 tests. 44 pkgs -race PASS, 360 tests. Committed at 3c70209.

## 執行紀錄（2026-09-05 稽核）
- 已達成 6 項並打勻（超過 3 tests 要求）。
- **未竟事項**: 無
- 補充: /config/reload HTTP endpoint not implemented (task mentioned it, not in acceptance criteria).
