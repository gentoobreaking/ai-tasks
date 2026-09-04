---
github_issue: N/A
title: P4 - MCP Spec: Advanced/Future methods (elicitation, tasks, discovery, subscriptions)
type: feat
priority: low
status: pending
depends_on:
  - T101
assignee: "pi with opencode"
created: 2026-09-05
updated: 2026-09-05
---

# T102 - MCP Spec: Advanced & Future-Spec Methods

## 目標
Implement remaining MCP spec methods that are either advanced (elicitation) or from future spec drafts (tasks, discovery, subscriptions). These are not part of the MCP 2024-11-05 core spec but are referenced in newer versions and mark3labs/mcp-go v1.0.0:
- `elicitation/create` — server asks client for user input (advanced, MCP §6)
- `notifications/elicitation/complete` — client completes elicitation request
- `tasks/get`, `tasks/list`, `tasks/result`, `tasks/cancel` — task management (future spec)
- `server/discover` — server capability discovery
- `subscriptions/listen`, `notifications/subscriptions/acknowledged` — subscription protocol
- `roots/list` — server requests client's root directories

## 驗收標準
- [ ] `elicitation/create` handled by `router.Dispatch()` → stores request, returns elicitation request to caller
- [ ] `notifications/elicitation/complete` handled → resolves pending elicitation
- [ ] `tasks/get` handled → returns `TaskResult` with status
- [ ] `tasks/list` handled → returns list of tasks
- [ ] `tasks/cancel` handled → cancels a task
- [ ] `server/discover` handled → returns server capabilities
- [ ] `subscriptions/listen` handled → stores subscription URI
- [ ] Protocol types added: `ElicitationCreateParams`, `ElicitationResult`, `TaskResult`, `TaskStatus`, `ListRootsResult`, `Root`, `SubscriptionListenParams`
- [ ] Elicitation request registry on Router (track pending requests by token)
- [ ] Task registry on Router (track tasks by ID with status)
- [ ] 8 tests: elicitation/create, elicitation/complete, tasks/get, tasks/list, tasks/cancel, server/discover, subscriptions/listen, roots/list
- [ ] `go test -race ./... -count=1` all pass
- [ ] `go vet ./...` no errors

## 備註
**Context**: After T101, the remaining gaps are advanced/future-spec methods. These are not part of the MCP 2024-11-05 core spec released at the time of the initial implementation, but are included in later spec versions and mark3labs/mcp-go v1.0.0.

**Complexity Note**: `elicitation/create` requires the server to handle a round-trip: server requests input from client, client responds via `notifications/elicitation/complete`. This requires a pending request registry and a mechanism for the server to block/wait for client response. Similarly, `tasks/*` requires a task execution framework.

**Implementation Priority**:
1. `server/discover` (low complexity — returns static capabilities)
2. `subscriptions/listen` (low — follows same pattern as resources/subscribe)
3. `roots/list` (low — returns stored roots, like resources/list)
4. `elicitation/create` + `notifications/elicitation/complete` (medium — needs pending request registry)
5. `tasks/*` (high — requires full task lifecycle management)

**Key Files**:
- `core/protocol/types.go` — add all protocol types
- `core/router/router.go` — add dispatch cases + registries
- `core/router/router_test.go` — add 8 tests

**Reference**: mark3labs/mcp-go v1.0.0 types used for spec alignment:
- `mcp.MethodElicitationCreate` = `"elicitation/create"`
- `mcp.MethodListRoots` = `"roots/list"`
- `mcp.MethodServerDiscover` = `"server/discover"`
- Task-related methods use `tasks/` prefix
