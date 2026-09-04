---
github_issue: N/A
title: P3 - MCP Spec Conformance: Missing optional methods (prompts/create, notifications/list_changed)
type: feat
priority: low
status: done
depends_on:
  - T089
assignee: "pi with opencode"
created: 2026-09-05
updated: 2026-09-05
---

# T100 - MCP Spec Conformance: Missing Optional Methods

## 目標
Implement remaining MCP spec optional server-side methods and client→server notifications to reach **A+ compliance** (full optional method coverage):
- `prompts/create` — dynamically register a new prompt at runtime
- `notifications/prompts/list_changed` — client notifies server that prompt list changed
- `notifications/resources/list_changed` — client notifies server that resources changed
- `notifications/tools/list_changed` — server notifies client that tools changed (server→client)

## 驗收標準
- [ ] `prompts/create` handled by `router.Dispatch()` → stores prompt, returns success
- [ ] `notifications/prompts/list_changed` handled → clears prompt cache / triggers refresh
- [ ] `notifications/resources/list_changed` handled → triggers resource registry refresh
- [ ] `notifications/tools/list_changed` — protocol type for server→client notification
- [ ] `PromptCreateParams` type in `core/protocol/types.go`
- [ ] `ToolListChangedNotification` type in `core/protocol/types.go`
- [ ] 4 tests: prompts/create, prompts/list_changed notification, resources/list_changed notification, tools/list_changed notification
- [ ] `go test -race ./... -count=1` all pass
- [ ] `go vet ./...` no errors

## 備註
**Context**: After T089 + T099, the remaining gaps are low-priority optional methods. These are all either:
1. Client→server notifications (server just needs to acknowledge/handle)
2. Server→client notifications (requires T099 transport push infrastructure)

**Implementation Priority**:
1. `prompts/create` (moderate — follows same pattern as tool/resource creation)
2. `notifications/prompts/list_changed` (trivial — notification ack)
3. `notifications/resources/list_changed` (trivial — notification ack)
4. `notifications/tools/list_changed` (depends on T099 for push capability)

**Key Files**:
- `core/router/router.go` — add dispatch cases
- `core/protocol/types.go` — add types
- `core/router/router_test.go` — add tests

**Note**: If T099 is implemented first, `notifications/tools/list_changed` can use the existing push infrastructure. If T099 is not done, this method is deferred to T099's follow-up task.
