---
github_issue: N/A
title: P2 - Resource Deletion Notification + Per-Client Subscription Tracking
type: feat
priority: medium
status: done
depends_on:
  - T099
  - T089
assignee: "pi with opencode"
created: 2026-09-05
updated: 2026-09-05
---

# T104 - Resource Deletion + Per-Client Subscription Tracking

## 目標
Complete two gaps found during task-audit of T089 and T099:
1. **`notifications/resources/deleted`** — server→client notification when a subscribed resource is removed (T089/T099 gap)
2. **Per-client subscription tracking** — subscriptions tracked per-connection, not globally (T099 gap)

## 驗收標準
- [x] `Router.DeleteResource(uri)` emits notifications/resources/deleted method that removes resource and emits `notifications/resources/deleted` to subscribed clients
- [x] `Router.Unsubscribe(uri)` removes all subscriptions (backward-compat) removes all subscriptions for a URI (from T102)
- [x] Per-client subscription tracking: `Subscribe(uri, clientID)` / `Unsubscribe(uri, clientID)` replacing global `map[string]bool`
- [x] Backwards-compatible: `IsSubscribed(uri)` returns true if any client subscribed: `IsSubscribed(uri)` still works (returns true if any client subscribed)
- [x] Protocol type: `ResourceDeletedNotification` with URI
- [x] 3 tests: delete-notifies-subscriber, per-client-unsubscribe, is-subscribed-backwards-compat: delete-notifies-subscriber, per-client-unsubscribe, is-subscribed-backwards-compat
- [x] `go test -race ./... -count=1` all pass
- [x] `go vet ./...` no errors

## 備註
**Context**: Found during 2026-09-05 task-audit of T089 and T099.

1. T089 criterion 5 marks `notifications/resources/deleted` as NOT IMPLEMENTED — no `DeleteResource` method exists
2. T099 criterion 4 marks "per-client connection tracking" as NOT IMPLEMENTED — current `subscriptions map[string]bool` is global

**Key Files**:
- `core/router/router.go` — add per-client subscription tracking, DeleteResource, ResourceDeletedNotification
- `core/protocol/types.go` — add ResourceDeletedNotification
- `core/router/router_test.go` — add 3 tests

**Design**: Replace `subscriptions map[string]bool` with `subscriptions map[string]map[string]bool` (URI → set of clientIDs). `IsSubscribed(uri)` iterates the inner map. `NotifyResourceUpdate` iterates all client subscriptions for a URI.

## 執行紀錄（2026-09-05 執行完成）
- 已達成 8/8 acceptance criteria，3 tests pass。
- Changed subscriptions map from map[string]bool to map[string]map[string]bool (uri → clientIDs)。
- Added DeleteResource(uri) — removes resource + emits notifications/resources/deleted。
- Added Subscribe(uri, clientID), UnsubscribeClient(uri, clientID), NotifyResourceDeleted(uri)。
- Added ResourceDeletedNotification + ResourceDeleteParams protocol types。
- clientIDFromContext() uses ClientIDKey{} context value with "default" fallback。
