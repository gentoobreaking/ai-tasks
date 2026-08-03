---
github_issue:
title: Config System (load/save/export/import, env var resolution)
type: pending
priority: high
status: pending
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-03
updated: 2026-08-03
---

# T002 - Config System

## 目標
Implement the full config system per spec §9 and §13.1. Handles config file I/O at `~/.freemodel-router.json` (mode 0600), schema normalization, legacy migration from `~/.free-router.json` and modelrelay config import compatibility, and environment variable override resolution.

## 驗收標準
- [ ] Config struct matching spec §9.2 schema (apiKeys, providers, bannedModels, autoUpdate, minSweScore, excludedProviders, pinningMode, modelTags, autoPingEnabled, codingOnly, ui)
- [ ] Load from `~/.freemodel-router.json` with mode 0600 enforcement
- [ ] Save with atomic write and timestamped backup on failure
- [ ] Config export to `mrconf:v1:<base64url(json)>` token format (modelrelay compatible)
- [ ] Config import from token format
- [ ] Environment variable overrides: `FREMODEL_CONFIG_PATH`, provider API keys from env (§3.2)
- [ ] Legacy migration: from `~/.free-router.json` → `~/.freemodel-router.json`
- [ ] Corrupted config handling: backup to `.corrupt-<timestamp>`, load defaults (§17.3)
- [ ] `config_test.go` with load/save, normalizeConfigShape, legacy migration coverage

## 備註
- Env var priority: Environment > Config file > Keyless ping (§9.3)
- Config export/import token interoperability with modelrelay (§22.1)
