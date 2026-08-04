---
github_issue:
title: 'Fix: Config path per spec + FREMODEL_CONFIG_PATH env support'
type: bugfix
priority: high
status: pending
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-04
updated: 2026-08-04
---

# T028 - Fix: Config path & env override

## 目標
Fix the P0 bug where `FREMODEL_CONFIG_PATH` env var (spec §18) is never consulted by `config.Load()/Save()`, and the default config path deviates from spec §9.1 (`~/.freemodel-router.json`). Also ensure the legacy `~/.free-router.json` migration (spec §22.2) actually writes the migrated config to the new path.

## 驗收標準
- [ ] `config.ConfigPath()` resolves `FREMODEL_CONFIG_PATH` first, else `~/.freemodel-router.json` (spec §9.1)
- [ ] `Load()`/`Save()`/`ExportToken`/`ImportToken` all use the resolved path
- [ ] Legacy migration: if `~/.free-router.json` exists and no new config, load + migrate + save to new path (spec §22.2)
- [ ] Config directory (if in a subdir) created with 0700
- [ ] Tests updated: default path, env override path, legacy migration writes new file

## 備註
- 保持 config 檔 mode 0600
- README 中的 config path 文件需同步更新
