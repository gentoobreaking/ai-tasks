---
github_issue:
title: 'Fix: wire AutoPingEnabled to the ping engine'
type: bugfix
priority: medium
status: done
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-04
updated: 2026-08-04
---

# T050 - Fix: auto-ping toggle must actually control the engine

## 目標
`cfg.AutoPingEnabled` is persisted and served by `/api/auto-ping` GET/POST but never consulted — TUI (`tui.go:114`) and server (`main.go:199`) call `engine.Start()` unconditionally, so `autoPing: false` has no runtime effect.

## 驗收標準
- [ ] TUI `Run()` starts the engine only when `cfg.AutoPingEnabled` (default true)
- [ ] Server `runServer` starts the engine only when enabled; `defer engine.Stop()` stays (Stop is a no-op when not started)
- [ ] `POST /api/auto-ping` toggles the running engine via `Server.SetEngine(...)`: enable → `Start()`, disable → `Stop()`
- [ ] Unit test: disabled config → engine not running (`Engine.Running()` accessor if needed); API toggle starts/stops a stub engine
- [ ] `go build`, `go test ./...` pass

## 備註
- Engine.Start/Stop 均已加鎖且可重複呼叫
