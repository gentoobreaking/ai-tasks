---
github_issue:
title: 'Feat: wire real API implementations (models/ping, providers, account-status)'
type: feature
priority: medium
status: done
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-04
updated: 2026-08-04
---

# T046 - Fix: replace API stubs with real implementations

## 目標
Replace remaining placeholder API handlers in `internal/router/server.go`:
- `POST /api/models/ping` — real synchronous single ping (same approach as TUI test-ping), returns `{status, httpCode, latency}`
- `POST /api/providers/<key>` — run `providers.Manager.DiscoverModels` for that provider and merge results into the registry (new models with `Endpoint` = provider URL), returns `{added}`
- `POST /api/providers-refresh-all` — discover all keyed providers, merge, returns refreshed list
- `GET /api/account-status` — per-provider `{provider, keyCount, enabled}` from config/env overrides

Server needs the `providers.Manager`: add `Server.SetProviders(mgr)`; `buildRegistry` in `cmd/freemodel/main.go` returns the manager and main passes it.

## 驗收標準
- [ ] All four endpoints return real data; stubs removed
- [ ] `buildRegistry` returns `*providers.Manager`; server wired in all run modes
- [ ] Discovered models merged into registry (dedupe by ID)
- [ ] Unit tests: /api/models/ping hits a httptest upstream and reports status; account-status reflects config providers; provider discovery merge adds a model
- [ ] `go build`, `go vet`, `go test ./...` pass

## 備註
- Discovery 呼叫需單 goroutine 順序執行（mgr mutex 已保護）
- /api/models/ping 的實作方式與 TUI `testProviderPing` 一致（短 timeout direct HTTP）
