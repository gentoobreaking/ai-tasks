---
github_issue:
title: Auto-Update System
type: pending
priority: medium
status: done
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-03
updated: 2026-08-04
---

# T020 - Auto-Update System

## 目標
Implement `internal/cli/update.go` per spec §12.1. Checks GitHub releases for new versions every 24 hours (configurable), downloads the new binary, and restarts. Disabled when running from source (git).

## 驗收標準
- [x] `freemodel update` — manual update check & apply
- [x] `freemodel autoupdate [--enable|--disable|--status] [--interval <hours>]` — toggle auto-update
- [x] Auto-update config stored in `~/.freemodel-router.json` under `autoUpdate` (§9.2):
  - enabled, intervalHours (default 24), lastCheckAt, lastUpdateAt, lastVersionApplied, lastError
- [x] Fetches `https://github.com/freemodel/router/releases/latest` on startup
- [x] Downloads new binary and restarts process
- [x] Auto-update disabled when running from git source (§12.1)
- [x] `FREMODEL_UPDATE_TARBALL` env var to override update source for local testing (§12.1)
- [x] `GET/POST /api/autoupdate` endpoints for web config

## 備註
- Version stored in `VERSION` file, read at startup (§14.8)
