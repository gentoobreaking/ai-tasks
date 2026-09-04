---
github_issue: N/A
title: P0 - MCP Spec Compliance: JSON tags, notifications/cancel, dispatch coverage
type: fixup
priority: critical
status: done
depends_on:
  - T086
assignee: "pi with opencode"
created: 2026-09-04
updated: 2026-09-04
---

# T087 - MCP Spec Compliance: JSON tags, notifications/cancel, dispatch coverage

## 目標

Fix remaining MCP compliance issues preventing full spec adherence:
- PromptMessage JSON tags for proper serialization
- notifications/cancel notification handler
- Comprehensive dispatch test coverage

## 驗收標準

- [x] `core/prompt/prompt.go`: `PromptMessage` has `json:"role"` / `json:"content"` tags
- [x] `core/prompt/prompt.go`: `PromptResponse` has `json:"description,omitempty"` / `json:"messages"` tags
- [x] `core/router/router.go`: `notifications/cancel` handled in Dispatch switch
- [x] `core/router/router.go`: `initialized` notification handled
- [x] 14 new router tests covering all dispatch paths
- [x] `go test -race ./... -count=1` all packages pass (39 packages)
- [x] `go vet ./...` no errors

## 備註

### 問題

After T086 fixed the 3 blockers (transport wiring, dispatch stubs, empty tests), 2 remaining compliance gaps:

1. **PromptMessage serialization**: `PromptMessage` struct had no JSON tags,
   causing `{"Role":"...","Content":"..."}` instead of MCP-spec `{"role":"...","content":"..."}`

2. **notifications/cancel**: Router didn't handle the `notifications/cancel` method,
   meaning clients couldn't cancel in-flight requests

3. **dispatch test coverage**: Router had only 2 trivial tests (unknown method, nil check).
   No tests for initialize, tools/list, tools/call, resources/list, prompts/list/get.

### 修復

**core/prompt/prompt.go** — Added JSON tags to `PromptMessage` and `PromptResponse`:
```go
type PromptMessage struct {
    Role    string `json:"role"`
    Content string `json:"content"`
}
type PromptResponse struct {
    Description string           `json:"description,omitempty"`
    Messages    []PromptMessage  `json:"messages"`
}
```

**core/router/router.go** — Added `notifications/cancel` and `initialized` cases to Dispatch switch

**core/router/router_test.go** — Added 14 tests covering:
- `tools/list` (empty + with registered)
- `tools/call` (success + tool not found)
- `resources/list` (empty)
- `resources/read` (registered)
- `prompts/list` (empty + with registered)
- `prompts/get` (registered)
- `initialize` (handshake)
- `notifications/cancel`
- `initialized`

## 執行紀錄
- 2026-09-04: Fixed JSON tags, added notifications/cancel, added 14 router tests. 39 packages pass -race. Committed at 0ad5a37.
