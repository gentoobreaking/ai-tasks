---
github_issue:
title: 'Fix: Router config propagation (codingOnly / bannedModels / --ban)'
type: bugfix
priority: medium
status: done
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-04
updated: 2026-08-04
---

# T035 - Fix: Router config propagation

## 目標
Fix the P2 bug where `eligible()` in `internal/router/routing.go:194` checks `codingOnly`/`bannedModels` flags on the Model struct, but main.go never propagates `cfg.CodingOnly` or `--ban` options into the registry. Router config must actually affect model selection.

## 驗收標準
- [ ] `registry.FlagCodingOnly(bool)` marks eligible coding-tagged models (spec §3.2)
- [ ] `registry.BanModels([]string)` / `--ban` CLI flag marks models banned (spec §3.3); `--ban` overrides config
- [ ] `eligible()` skips non-coding models when codingOnly set; skips banned models
- [ ] `freemodel serve --ban foo` and config `banned_models` both work; verified via router test with a coded+non-coded pair
- [ ] `--unban` clearing behavior for CLI (list of bans additive to config)
- [ ] All existing tests pass

## 備註
- Model struct 已有 Coding/Flags 欄位，僅需從 main.go 傳遞
