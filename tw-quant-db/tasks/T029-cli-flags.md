---
id: T029
project: tw-quant-db
assignee: "pi"
priority: high
type: implementation
status: done
depends_on: []
github_issue: https://github.com/gentoobreaking/ai-tasks/issues/65
created: 2026-08-31
updated: 2026-08-31
---

# T029 - CLI Flags

## 目標
實作 spec §8 和 §12 的 CLI interface。

## 驗收標準
- [x] `--start YYYY-MM-DD` / `--end YYYY-MM-DD`: specific date range
- [x] `--symbol XXX`: single stock override
- [x] `--stock-ids 2330,3008`: comma-separated stock IDs
- [x] `--dry-run`: no writes
- [x] `--range 5Y|3M`: range shortcut (spec §12 CLI 擴充)
- [x] `--strategy monthly|auto`: batch strategy
- [x] `--sources mcp|http|both`: source mode selection (spec §14 CLI Flags)

## 備註
- spec §8 原本是 Python CLI (`python backfill_core.py --auto`)
- spec §13 語言改用 Go，CLI 改為 `go run backfill_core.go` / binary
- `--auto` 模式: detect all missing since last update
