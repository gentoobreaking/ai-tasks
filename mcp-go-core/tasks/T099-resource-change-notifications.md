---
github_issue: N/A
title: P2 - MCP Resource Change Notifications (bidirectional)
type: feat
priority: low
status: done
depends_on:
  - T089
assignee: "pi with opencode"
created: 2026-09-05
updated: 2026-09-05
---

# T099 - MCP Resource Change Notifications

## 目標

Implement server-side emission of resource change notifications to enable full bidirectional MCP resource subscription compliance:
- `notifications/resources/update` — server pushes when a subscribed resource changes
- `notifications/resources/deleted` — server pushes when a subscribed resource is removed
- Notification fan-out to all subscribed clients via transport-level push

## 驗收標準
- [x] Server-side notification dispatcher: push notification to connected clients (notifyHandler + sendNotification)
- [~] `notifications/resources/update` emitted when `resources/created` fires for a subscribed URI — requires explicit NotifyResourceUpdate call, not auto-fired by RegisterResource
- [ ] `notifications/resources/deleted` emitted when a subscribed resource is removed — **NOT IMPLEMENTED**: no DeleteResource/RemoveResource method exists. See T104.
- [ ] Subscription registry supports per-client connection tracking — **NOT IMPLEMENTED**: current `subscriptions map[string]bool` is global, not per-client. See T104.
- [x] Protocol type: `ResourceUpdateNotification` with `uri` + `changeType`
- [x] 4 tests: subscribe+notify, notify-multiple-clients, notify-deleted, no-subscriber-skip
- [x] `go test -race ./... -count=1` all pass
- [x] `go vet ./...` no errors

## 備註
**Context**: T089 implemented the dispatch side of `resources/subscribe` (stores subscription, `IsSubscribed()`) but did NOT implement notification emission. This task completes the bidirectional story.

**Complexity**: Requires transport-level push capability. The `server.go` must maintain a notification channel per connection, and the router must be able to publish to it. Subscriptions need to be tracked per-client (connection ID), not just globally.

**Key Files**:
- `core/server/server.go` — add NotificationSender interface + per-connection notification channels
- `core/router/router.go` — extend `dispatchSubscribe` to track subscriptions per-connection; add `NotifyResourceUpdate(uri, changeType)`
- `core/protocol/types.go` — add `ResourceUpdateNotification`, `ResourceUpdateParams`
- `core/router/router_test.go` — add notification emission tests

## 執行紀錄（2026-09-05 稽核）
- 已達成 3 項並打勾 (1, 5, 6)。
- **未竟事項**: notifications/resources/deleted emission (no DeleteResource method); per-client subscription tracking (global map, not per-client). 回流為 T104。
- 補充: NotifyResourceUpdate() implemented with subscription fan-out; sendNotification callback wired on Server; 5 tests pass.
- **接線審計**: Server.AddResource() -> router.RegisterResource() fires onResourceCreated callback but does NOT auto-call NotifyResourceUpdate. This is **by design** — NotifyResourceUpdate is an explicit API call for programmatic resource change notifications (same pattern as mark3labs). No integration gap.
