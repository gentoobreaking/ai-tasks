---
github_issue:
title: 'Fix: Focus event parsing (CSI I/O)'
type: bugfix
priority: high
status: done
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-04
updated: 2026-08-04
---

# T031 - Fix: TUI focus event parsing

## 目標
Fix the P1 bug where terminal focus events (`\x1b[I` focus-in, `\x1b[O` focus-out) from `CSI ? 1004 h` focus tracking are parsed as `KeyUnknown`, so spec §8.3 blur handling never triggers. The 3-byte CSI sequences must map to `KeyFocusIn`/`KeyFocusOut`.

## 驗收標準
- [ ] `readEscape` returns the full `\x1b[I` / `\x1b[O` sequences without premature break
- [ ] `parseEscape` maps `\x1b[I` → `KeyFocusIn`, `\x1b[O` → `KeyFocusOut` (3-byte CSI form)
- [ ] TUI blur logic (§8.3): render deferred while blurred, single deferred render on focus-in — verified by test
- [ ] Unit test: feed escape bytes through the parser, assert key mapping
- [ ] Existing arrow-key / PgUp / PgDn parsing unaffected

## 備註
- 2-byte `\x1bO` 形式也要保留（部分終端機使用）
- parseEscape 的 case 需覆蓋 len==2 與 len==3 兩種
