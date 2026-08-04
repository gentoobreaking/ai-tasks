---
github_issue:
title: Request Logging
type: pending
priority: medium
status: done
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-03
updated: 2026-08-04
---

# T011 - Request Logging

## 目標
Implement `internal/router/logging.go` per spec §7.7. Persists request logs to `~/.freemodel-router-logs.json` with a 200-entry rolling window (mode 0600). Logs include resolved model/provider, duration, TTFB, HTTP status, message content (truncated unless debug), tool calls, usage tokens, and retry attempts.

## 驗收標準
- [x] Log file: `~/.freemodel-router-logs.json`, mode 0600, max 200 entries
- [x] Log entry fields: timestamp, resolved model, provider, duration, TTFB, HTTP status, message content, tool calls, usage tokens, retry attempts with status codes
- [x] Message content truncated for errors, full in debug mode (`--log` flag, `FREMODEL_LOG=1`)
- [x] Rolling window: oldest entries evicted when exceeding 200
- [x] `GET /api/logs` endpoint returns recent logs

## 備註
- `--log` / `--no-log` flags control logging (§10.2)
