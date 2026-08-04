---
github_issue:
title: 'Fix: config has no mutex; API handlers race'
type: bugfix
priority: medium
status: done
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-04
updated: 2026-08-04
---

# T053 - Fix: thread-safe config access

## 目標
`config.Config` has no synchronization; `/api/config` GET marshals the config while POST handlers mutate it, and `/api/auto-ping`, `/api/filter-rules`, `/api/autoupdate`, `/api/config/import`, `/api/account-status` read/write fields concurrently → data race under concurrent requests.

## 驗收標準
- [ ] `Config` gains an unexported `sync.RWMutex` + `Lock/Unlock/RLock/RUnlock` helpers (mutex not serialized by json.Marshal)
- [ ] `config.Save` marshals under `RLock` (called unlocked by CLI/TUI paths)
- [ ] Server handlers: reads under `RLock` (GET config marshals inside the lock), mutations under `Lock`, `Save` called after `Unlock` (no nested locks)
- [ ] `/api/account-status` and `/api/auto-ping` GET read under `RLock`
- [ ] Race test: concurrent `/api/config` GET + POST against `httptest` server passes `-race`
- [ ] `go test -race ./internal/router/ ./internal/config/` pass
