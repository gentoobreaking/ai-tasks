---
github_issue:
title: CLI Commands (flags, best mode, status)
type: pending
priority: high
status: done
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-03
updated: 2026-08-04
---

# T018 - CLI Commands

## 目標
Implement `internal/cli/flags.go`, `internal/cli/best.go`, and `internal/cli/status.go` per spec §10.2-10.3. Handles CLI flag parsing, `--best` non-interactive mode, and status display.

## 驗收標準
- [x] `internal/cli/flags.go`: Parse all CLI flags (§10.2):
  - `--port <n>` — router HTTP port (default 7352)
  - `--log` — enable request payload logging
  - `--no-log` — disable request logging (default)
  - `--ban <ids>` — comma-separated model IDs to ban
  - `--all-models` — disable coding-only filter
  - `--onboard` — same as `onboard` subcommand
  - `--help` / `-h` — show help
  - `--version` / `-v` — show version
- [x] `freemodel` (no args) — default interactive TUI
- [x] `freemodel start [--port 7352]` — start router server (background mode)
- [x] `internal/cli/best.go` — `--best` mode (§10.3):
  - Non-interactive: pings all models for 4 rounds, prints best model ID to stdout
  - Tri-key sort: status=up → lowest avg latency → highest uptime
  - Designed for scripting: `MODEL=$(freemodel --best)`
- [x] `internal/cli/status.go` — `freemodel status` (§12.3):
  - Configured providers and account pools
  - Live request counts and rate-limit status (if router running)
  - Current autostart and auto-update state
- [x] `cli_test.go` with arg parsing for all CLI flags and subcommands

## 備註
- `FREMODEL_PORT` env var overrides default port (§18)
