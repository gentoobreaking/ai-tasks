---
github_issue:
title: CLI Onboard & Config Commands
type: pending
priority: high
status: pending
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-03
updated: 2026-08-03
---

# T019 - CLI Onboard & Config Commands

## 目標
Implement `internal/cli/onboard.go` and the `freemodel config` subcommand suite per spec §10.1. Provides interactive key setup wizard and config management commands.

## 驗收標準
- [ ] `internal/cli/onboard.go` — `freemodel onboard` / `--onboard`:
  - Interactive key setup wizard
  - Per-provider key entry with validation
  - Auto-opens signup URLs
- [ ] Config subcommands:
  - `freemodel config export` — print config as `mrconf:v1:<token>` (§10.1)
  - `freemodel config import <token>` — import config from token (§22.1)
  - `freemodel config set-keys <provider> <key1,key2,...>` — set API keys (array format for multi-account)
  - `freemodel config add-key <provider> <key>` — add a key to provider's pool
  - `freemodel config remove-key <provider> <key|index>` — remove key from pool
  - `freemodel config set-maxturns <provider> <number>` — set proactive rotation turns
- [ ] Keyless ping fallback when no API key is configured (§9.3)

## 備註
- Multi-account key pool management is via CLI, not TUI (§19 Non-Goals #3)
