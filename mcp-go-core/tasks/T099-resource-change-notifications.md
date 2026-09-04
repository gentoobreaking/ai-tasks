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
- [ ] Server-side notification dispatcher: push notification to connected clients
- [ ] `notifications/resources/update` emitted when `resources/created` fires for a subscribed URI
- [ ] `notifications/resources/deleted` emitted when a subscribed resource is removed
- [ ] Subscription registry supports per-client connection tracking (not just global URI->bool)
- [ ] Protocol type: `ResourceUpdateNotification` with `uri` + `changeType`
- [ ] 4 tests: subscribe+notify, notify-multiple-clients, notify-deleted, no-subscriber-skip
- [ ] `go test -race ./... -count=1` all pass
- [ ] `go vet ./...` no errors

## 備註
**Context**: T089 implemented the dispatch side of `resources/subscribe` (stores subscription, `IsSubscribed()`) but did NOT implement notification emission. This task completes the bidirectional story.

**Complexity**: Requires transport-level push capability. The `server.go` must maintain a notification channel per connection, and the router must be able to publish to it. Subscriptions need to be tracked per-client (connection ID), not just globally.

**Key Files**:
- `core/server/server.go` — add NotificationSender interface + per-connection notification channels
- `core/router/router.go` — extend `dispatchSubscribe` to track subscriptions per-connection; add `NotifyResourceUpdate(uri, changeType)`
- `core/protocol/types.go` — add `ResourceUpdateNotification`, `ResourceUpdateParams`
- `core/router/router_test.go` — add notification emission tests
