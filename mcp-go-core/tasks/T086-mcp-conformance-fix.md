---
github_issue: N/A
title: P0 - MCP Spec Conformity: Fix Server-Transport-Router wiring
type: fixup
priority: critical
status: done
depends_on:
  - T008
assignee: "pi with opencode"
created: 2026-09-04
updated: 2026-09-04
---

# T086 - MCP Spec Conformity: Fix Server-Transport-Router wiring

## 目標

Fix the 5 MCP compliance issues preventing production readiness. After this task:
- Server.Run() calls transport.Serve() with a real handler
- Router.Dispatch() implements tools/list, tools/call, resources/list, prompts/list
- Server handles initialize handshake with ServerCapabilities
- RT-001~RT-005 smoke tests validate real protocol behavior

## 驗收標準

- [x] `router.Dispatch()` implements `tools/list` → `protocol.ToolListResult` with registered tools
- [x] `router.Dispatch()` implements `tools/call` → parse `{name, arguments}` params → call `tool.Handler()`
- [x] `router.Dispatch()` implements `resources/list` → `protocol.ResourceListResult`
- [x] `router.Dispatch()` implements `prompts/list` → `protocol.PromptListResult`
- [x] `Server.Run()` wires transport via `s.transport.Serve(ctx, handler)` in a goroutine
- [x] `Server` handles `initialize` method: returns `InitializeResponse` with `ServerCapabilities`
- [x] RT-002: smoke test sends `initialize` request → asserts server name, capabilities
- [x] RT-003: smoke test sends `tools/list` → asserts JSON response contains registered tool
- [x] RT-004: smoke test sends `tools/call` → asserts response result is `my-result`
- [x] RT-005: graceful shutdown test still passes
- [x] `TestFullMCPRoundTrip` sends a real `tools/call` through MockTransport → router
- [x] `go test -race ./... -count=1` all packages pass (39 packages)
- [x] `go vet ./...` no errors

## 備註

### 現狀分析

1. **`Server.Run()` never calls `transport.Serve()`**
   - blocks on `<-ctx.Done()`, transport stored but unused

2. **`router.Dispatch()` 所有 handler 都是 stub**
   - returned "tool dispatch not fully implemented"

3. **RT-002~RT-004 smoke tests 都是空殼**
   - only nil checks, no real protocol flow

4. **缺少 `initialize` 握手**
   - No `ServerCapabilities` generation

5. **缺少 `tools/list`, `resources/list`, `prompts/list` 路由**

### 修復方向

**Phase 1: Router Implementation (`core/router/router.go`)** — DONE
- `dispatchListTools`, `dispatchCallTool`, `dispatchListResources`, `dispatchListPrompts` implemented
- Added `handleInitialize` with `ServerCapabilities`

**Phase 2: Server Integration (`core/server/server.go`)** — DONE
- `Run()` calls `transport.Serve(ctx, handler)` in a goroutine
- `handleMessage` converts JSON-RPC to `router.Dispatch`

**Phase 3: Test Rewrite (`tests/smoke/`) — DONE**
- All RT tests now validate real protocol flow

## 執行紀錄
- 2026-09-04: Implemented all Phases 1-3. 39 packages pass with race detector. 12 smoke tests pass.
