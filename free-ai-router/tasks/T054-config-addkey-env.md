---
github_issue:
title: 'Fix: config add/remove-key must not touch env keys'
type: bugfix
priority: low
status: done
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-04
updated: 2026-08-04
---

# T054 - Fix: add-key persists env override keys

## 目標
`configAddKey`/`configRemoveKey` (`internal/cli/config_cmd.go:106-183`) use `config.ResolveAPIKeys`, which returns env-var overrides first. For a provider configured via env (e.g. `NVIDIA_API_KEY`), `config add-key nvidia X` writes the env key value into the config file; `remove-key` operates on env data instead of config data.

## 驗收標準
- [ ] New `config.KeysFromConfig(provider, cfg)` returns keys from `cfg.APIKeys` only (no env)
- [ ] `configAddKey`/`configRemoveKey` use `KeysFromConfig`
- [ ] Unit tests: env var set for provider → `add-key` does not persist the env key; `remove-key` on missing config key errors
- [ ] `go build`, `go test ./...` pass
