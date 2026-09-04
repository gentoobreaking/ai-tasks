---
github_issue: N/A
title: P0 - MCP Spec Conformity: Fix Server-Transport-Router wiring
type: fixup
priority: critical
status: pending
depends_on:
  - T008
updated: 2026-09-04
assignee: "pi"
created: 2026-09-04
---

# T086 - MCP Spec Conformity: Fix Server-Transport-Router wiring

## 目標

Fix the 5 MCP compliance issues preventing production readiness. After this task:
- Server.Run() calls transport.Serve() with a real handler
- Router.Dispatch() implements tools/list, tools/call, resources/list, prompts/list
- Server handles initialize handshake with ServerCapabilities
- RT-001~RT-005 smoke tests validate real protocol behavior

## 驗收標準

- [ ] `router.Dispatch()` implements `tools/list` → `protocol.ToolListResult` with registered tools
- [ ] `router.Dispatch()` implements `tools/call` → parse `{name, arguments}` params → call `tool.Handler()`
- [ ] `router.Dispatch()` implements `resources/list` → `protocol.ResourceListResult`
- [ ] `router.Dispatch()` implements `prompts/list` → `protocol.PromptListResult`
- [ ] `Server.Run()` wires transport via `s.transport.Serve(ctx, handler)` in a goroutine
- [ ] `Server` handles `initialize` method: returns `InitializeResponse` with `ServerCapabilities`
- [ ] RT-002: smoke test sends `initialize` request → asserts server name, capabilities
- [ ] RT-003: smoke test sends `tools/list` → asserts JSON response contains registered tool
- [ ] RT-004: smoke test sends `tools/call` → asserts response content is `"result"`
- [ ] RT-005: graceful shutdown test still passes
- [ ] `TestFullMCPRoundTrip` sends a real `tools/call` through server → mock transport → asserts response
- [ ] `go test -race ./... -count=1` all packages pass
- [ ] `go vet ./...` no errors

## 備註

### 現狀分析

1. **`Server.Run()` never calls `transport.Serve()`**
   - `server.go:92-100` blocks on `<-ctx.Done()`, transport stored but unused
   - Builder stores transport but Run() never invokes it

2. **`router.Dispatch()` 所有 handler 都是 stub**
   - `dispatchTool`: returns `mcperror.CodeValidation, "tool dispatch not fully implemented"`
   - `dispatchResource`: returns `"resource dispatch not fully implemented"`
   - `dispatchPrompt`: returns `"prompt dispatch not fully implemented"`

3. **RT-002~RT-004 smoke tests 都是空殼**
   - RT-002: only checks `srv != nil` — no initialize request/response
   - RT-003: only calls `srv.AddTool()` then checks `srv != nil` — no `tools/list` request
   - RT-004: calls `tool.Handler()` directly — **bypasses router entirely**

4. **缺少 `initialize` 握手**
   - No handler for `initialize` method → first protocol method should be `initialize`
   - No `ServerCapabilities` generation or response

5. **缺少 `tools/list`, `resources/list`, `prompts/list` 路由**
   - Router only handles `tools/call`, `resources/read`, `prompts/get`
   - No `List` methods (list tools/resources/prompts)

### 修復方向

**Phase 1: Router Implementation (`core/router/router.go`)**
- `dispatchListTools(ctx, req)` → iterate `r.tools` → build `protocol.ToolListResult`
- `dispatchCallTool(ctx, req)` → parse `ToolCallRequest` `{name, arguments}` → find tool → call `tool.Handler()`
- `dispatchListResources(ctx, req)` → build `protocol.ResourceListResult` from `r.resources`
- `dispatchListPrompts(ctx, req)` → build `protocol.PromptListResult` from `r.prompts`

**Phase 2: Server Integration (`core/server/server.go`)**
- `Run()` creates a handler: `handler := func(ctx, msg json.RawMessage) (any, error) { return r.Dispatch(ctx, parsedReq) }`
- Start `s.transport.Serve(ctx, handler)` in a goroutine with WaitGroup
- `Dispatch` intercepts `initialize` → returns `InitializeResponse` with capabilities

**Phase 3: Test Rewrite (`tests/smoke/protocol_test.go`)**
- RT-002: construct `protocol.Request{Method: "initialize", ...}`, call a handler function that goes through router/dispatch, assert capabilities
- RT-003: register test tool, send `tools/list`, assert tool appears in response
- RT-004: register test tool, send `tools/call`, assert content == `"result"`
- FullRoundTrip: use a MockTransport + Server.Builder, send full `tools/call` through the actual transport→router→handler chain

## 執行紀錄
- 2026-09-04: Created task, pending implementation
