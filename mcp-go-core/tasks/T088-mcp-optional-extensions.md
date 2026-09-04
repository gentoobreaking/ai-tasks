---
github_issue: N/A
title: P2 - MCP Spec Compliance: Optional extensions (logging/setLogLevel, sampling/createMessage, resources/created)
type: feat
priority: medium
status: pending
depends_on:
  - T087
assignee: "pi with opencode"
created: 2026-09-04
updated: 2026-09-04
---

# T088 - MCP Spec Compliance: Optional Extensions

## 目標

Implement optional MCP protocol extensions to reach **A+ compliance**:
- `logging/setLogLevel` — accept client log level configuration
- `sampling/createMessage` — server-side LLM sampling capability
- `resources/created` notification — server can notify clients of new resources
- Consolidate duplicate `PromptResponse` types between `core/prompt` and `core/response`

## 驗收標準

- [ ] `router.Dispatch()` handles `logging/setLogLevel` → stores level, returns success
- [ ] `router.Dispatch()` handles `sampling/createMessage` → returns `SamplingMessage` response
- [ ] Server can emit `resources/created` notification when resource registered via `AddResource`
- [ ] `core/response.PromptResponse` unified with `core/prompt.PromptResponse` (no type duplication)
- [ ] Tests cover each new method (3+ tests)
- [ ] `go test -race ./... -count=1` all packages pass
- [ ] `go vet ./...` no errors

## 備註

### Context

After T086/T087, the core MCP protocol is functional (B+). Remaining gaps are **optional MCP extensions**:

1. **`logging/setLogLevel`** (MCP §6.3) — Client tells server to filter log messages. Currently no handler; server returns MethodNotFound. This is the low-risk next step since logging is implemented (T081).

2. **`sampling/createMessage`** (MCP §7) — Server requests an LLM sampling from the client. This enables server-side reasoning. Less commonly used for basic MCP servers, but in spec.

3. **`resources/created` notification** (MCP §4.2) — Server pushes notifications to client when resources are registered. Requires transport-level broadcast capability. Highest complexity.

4. **PromptResponse type duplication** — `core/prompt.PromptResponse` and `core/response.PromptResponse` both exist with similar fields. Should consolidate to one canonical type used by router dispatch.

### Implementation Priority

1. `logging/setLogLevel` (lowest complexity, good ROI)
2. PromptResponse consolidation (cleanup, prevents future bugs)
3. `sampling/createMessage` (moderate complexity)
4. `resources/created` notification (highest complexity)

### Key Files

- `core/router/router.go` — add method dispatch cases
- `core/prompt/prompt.go` — unify PromptResponse type
- `core/response/response.go` — remove duplicate PromptResp types if unified
- `core/server/server.go` — notification broadcast for resources/created
- `tests/smoke/` - add tests for new methods

## 執行紀錄
- 2026-09-04: Created task, pending implementation
