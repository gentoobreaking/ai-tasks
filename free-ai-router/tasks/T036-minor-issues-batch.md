---
github_issue:
title: 'Fix: Minor issues batch (discovery URL, logs, openBrowser, API stubs, version)'
type: bugfix
priority: medium
status: done
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-04
updated: 2026-08-04
---

# T036 - Fix: Minor issues batch

## 目標
Fix P2 findings:
1. Google discovery URL appends `/v1/models` instead of `/v1beta/models` (`internal/providers/providers.go:149`)
2. Log entries missing content/tool-calls/usage per §7.7 (`internal/router/logging.go`)
3. `openBrowser` is macOS-only (`internal/cli/onboard.go`) — add linux `xdg-open` + windows `rundll32` fallbacks
4. API stubs return `ok:true` without persisting (`/api/config` POST, `/api/filter-rules` GET/POST, `/api/autoupdate` POST) — persist to config
5. Version duplication between `VERSION` file and `cli.Version` const — derive from `VERSION` at build

## 驗收標準
- [ ] Google discovery hits `/v1beta/models`
- [ ] `LogEntry` includes message content, tool_calls, and usage tokens when present in request/response
- [ ] `openBrowser` works on linux/windows (uses best available opener, no error on CI headless)
- [ ] `/api/config` POST persists config; `/api/filter-rules` GET/POST reads/writes rules; `/api/autoupdate` POST persists state
- [ ] Single version source; `freemodel version` and `--version` output consistent
- [ ] Existing tests pass

## 備註
- filter-rules 資料結構需在 config 中新增欄位（`filter_rules`）
