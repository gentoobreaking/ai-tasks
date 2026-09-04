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

- [ ] Build server binary (profile=minimal)
- [ ] 執行 `./dist/server` → process starts
- [ ] Send MCP `initialize` request → valid `initialize` response (proper protocolVersion, capabilities)
- [ ] Send `tools/list` → correct tool list
- [ ] Send `tools/call` with test tool → correct result
- [ ] Send `shutdown` → graceful shutdown (process exits)
- [ ] `RT-001` test: server starts
- [ ] `RT-002` test: valid initialize response
- [ ] `RT-003` test: tool list correct
- [ ] `RT-004` test: tool call returns correct result
- [ ] `RT-005` test: graceful shutdown

## 備註

Smoke test validates the end-to-end pipeline: code generation → static composition → Go compiler → binary → runtime.
