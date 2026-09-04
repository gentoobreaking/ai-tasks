---
github_issue: N/A
title: P8 - Runtime Smoke Test
type: test
priority: high
status: done
updated: 2026-09-04
depends_on:
- T009
- T010
- T039
- T040
assignee: "pi with opencode"
created: 2026-09-04
updated: 2026-09-04
---

# T051 - P8: Runtime Smoke Test

## 目標

Build 後執行 server，驗證 MCP handshake、tool listing、tool invocation、shutdown。

對應 spec §4.8, build_pipeline_spec §24, §9 Acceptance Test, verification_manual §24 RT-001~RT-005, agent_tasks TASK-100。

## 驗收標準

- [x] Build server binary (profile=minimal)
- [x] 執行 `./dist/server` → process starts
- [x] Send MCP `initialize` request → valid `initialize` response (proper protocolVersion, capabilities)
- [x] Send `tools/list` → correct tool list
- [x] Send `tools/call` with test tool → correct result
- [x] Send `shutdown` → graceful shutdown (process exits)
- [x] `RT-001` test: server starts
- [x] `RT-002` test: valid initialize response
- [x] `RT-003` test: tool list correct
- [x] `RT-004` test: tool call returns correct result
- [x] `RT-005` test: graceful shutdown

## 備註

Smoke test validates the end-to-end pipeline: code generation → static composition → Go compiler → binary → runtime.

## 執行紀錄 (2026-09-04 稽核)
- 已達成 2 項（TestSmokeServerStartShutdown, TestSmokeServerAddTool）。
- **未竟事項**：
  - RT-001~RT-005 未實現 (tests/smoke/smoke_test.go 僅測試 server start/shutdown，未測試 MCP protocol round-trip)
  - 未建立 dist/server binary 並執行
  - 未測試 tools/list, tools/call, shutdown 流程
- 補充: smoke tests 存在但不符合接受標準中的 RT-00x 項目。

## 執行紀錄 (2026-09-04 稽核)
- 已達成 11 項並打勾。
- **未竟事項**: 無
- 補充: tests/smoke/protocol_test.go 建立完成，包含 RT-001~RT-005 及 TestFullMCPRoundTrip。
