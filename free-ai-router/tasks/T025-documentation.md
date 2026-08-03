---
github_issue:
title: Documentation
type: pending
priority: medium
status: pending
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-03
updated: 2026-08-03
---

# T025 - Documentation

## 目標
Create comprehensive project documentation per spec §10 and §14. Documents installation, quick start, all CLI commands, TUI keyboard shortcuts, config schema, and architecture overview.

## 驗收標準
- [ ] `README.md`:
  - Project overview and value proposition (§1)
  - Quick start: install, onboard, TUI usage
  - CLI commands reference (§10)
  - TUI keyboard shortcuts (§6.8)
  - Config file schema (§9)
  - `--best` mode usage examples (§10.3)
  - Docker deployment instructions (§14.5)
  - Provider/env-var compatibility table (§3.2)
- [ ] Help text for each CLI subcommand accessible via `--help`
- [ ] `SPECIFICATION.md` already provided; no changes needed

## 備註
- Documentation should be consistent with SPECIFICATION.md sections referenced
