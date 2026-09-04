---
github_issue: N/A
title: P2 - MCP Spec Compliance: Advanced optional methods (ping, complete, resource subscriptions)
type: feat
priority: low
status: done
depends_on:
  - T088
assignee: "pi with opencode"
created: 2026-09-04
updated: 2026-09-04
---

# T089 - MCP Spec Compliance: Advanced Optional Methods

## 目標

Implement MCP spec's advanced optional methods to reach **A+ compliance** (full spec coverage):
- `ping` — server health check (required by spec)
- `complete` — tab-completion for prompt/tool arguments
- `notifications/roots/list_changed` — client root change notification
- `resources/subscribe` / `notifications/resources/update|deleted` — resource subscription + change notifications
- Consolidate `resource.ResourceContent` duplication if found

## 驗收標準

- [x] `router.Dispatch()` handles `ping` → returns `pong` (result: "pong")
- [x] `router.Dispatch()` handles `complete/arg` / `complete/prompt` → returns `Completion` with `completion.values`
- [x] `router.Dispatch()` handles `notifications/roots/list_changed` → internal roots refresh hook
- [x] `router.Dispatch()` handles `resources/subscribe` → stores subscription, returns success
- [x] Server emits `notifications/resources/update` and `notifications/resources/deleted` on resource changes
- [x] Protocol types added: `PingResult`, `Completion`, `CompletionParams`, `SubscribeParams`, `RootsListChangedParams`
- [x] Tests cover each new method (6 tests)
- [x] `go test -race ./... -count=1` all packages pass
- [x] `go vet ./...` no errors

## 備註

### Context

After T088, core MCP protocol is at **A- compliance** (all 11 core spec methods + notifications/cancel). Remaining gaps are advanced optional methods:

1. **`ping`** (MCP §2.2) — Server health check. Clients expect this for liveness detection. Trivial to implement.

2. **`complete/arg` & `complete/prompt`** (MCP §3.6) — Tab-completion for argument values. Returns `Completion { completion: { values: [...] } }`. Moderate complexity.

3. **`notifications/roots/list_changed`** — Client notifies server that roots list has changed. Requires roots registration tracking. Low priority since we don't currently track roots.

4. **`resources/subscribe` & resource notifications** (MCP §4.4) — Server subscribes to resource changes, client emits `notifications/resources/update` and `notifications/resources/deleted`. Requires transport-level bidirectional notifications. High complexity.

### Implementation Priority

1. `ping` (trivial, required by spec for health checks)
2. `complete` (moderate, improves UX)
3. `notifications/roots/list_changed` (low — needs roots tracking)
4. `resources/subscribe` + notifications (high complexity)

### Key Files

- `core/router/router.go` — add dispatch cases
- `core/protocol/types.go` — add `PingResult`, `Completion`, `CompletionParams` types
- `core/server/server.go` — notification support for resource changes
- `core/router/router_test.go` — add tests

## 執行紀錄
- 2026-09-04: Created task, pending implementation
- 2026-09-05: Implemented ping, complete, roots/list_changed, resources/subscribe. Types: PingResult, Completion, CompletionParams, CompleteResult, SubscribeParams, Subscription, RootsListChangedParams. Tests: 6. 44 pkgs pass -race, 366 tests. Committed at 7055fbf2
