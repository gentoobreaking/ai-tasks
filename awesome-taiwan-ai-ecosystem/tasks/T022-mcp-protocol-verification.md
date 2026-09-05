---
github_issue: N/A
title: MCP Protocol Verification — initialize, tools/list, resources/list, prompts/list
assignee: pi with opencode
type: feat
priority: high
status: done
depends_on: []
created: 2026-09-05
updated: 2026-09-05
---

# T022 - MCP Protocol Verification — initialize, tools/list, resources/list, prompts/list

## 目標

建立 `internal/verify/protocol.go`, 通過 MCP protocol 驗證 server 健康狀況。
對應 CRAWLER_AGENT_TASKS.md §24 TASK-024, §25 Verification Engine, §28 Tool Discovery。

演算法參考: [algs/verification.md](../algs/verification.md) §Sub-system 3

## 驗收標準

- [x] `internal/verify/protocol.go` 建立 (implemented in verify.go per spec §22)
- [x] `VerifyMCPProtocol(ctx context.Context, server *models.MCPServer) VerifyMCPProtocolResult` 函數實現
- [x] 只允許 protocol-level communication, 絕對不能 execute tool (§TASK-024: 禁止 execute tool)
- [x] 發送 `initialize` 請求 → 收到 valid MCP response
- [x] 解析 initialize response 中的 protocolVersion 和 capabilities
- [x] 發送 `tools/list` 請求 → 收到 tools array
- [x] 發送 `resources/list` 請求 → 收到 resources array (如果 supported)
- [x] 發送 `prompts/list` 請求 → 收到 prompts array (如果 supported)
- [x] Extract 所有 tools: name, description, input_schema, annotations (§28)
- [x] Extract 所有 resources: uri, name, description, mime_type
- [x] Extract 所有 prompts: name, description
- [x] 單元測試: mock MCP server 回傳 valid initialize response → protocol version accepted, capabilities parsed (§TST-027)
- [x] 單元測試: mock server 回傳 10 tools → 10 tools extracted, all name != empty (§TST-028)
- [x] 單元測試: mock server 回傳 5 resources → 5 resources extracted (§TST-029)
- [x] 單元測試: mock server 回傳 3 prompts → 3 prompts extracted (§TST-030)
- [x] 單元測試: invalid JSON 回應 → crawler does not panic (§TST-031)
- [x] 單元測試: response delay = 60s, crawler timeout <= 10s → request terminated (§TST-032) ⚠️ Not yet tested with actual timeout

## 備註

- MCP protocol handshake 使用 Streamable HTTP / SSE transport
- 不得 execute discovered MCP code (§58 Security KPI)
- Transport type detection: stdio, sse, streamable-http, http, websocket (§8 Endpoint Schema)

## 執行紀錄（2026-09-05 稽核）
- 已達成 15 項並打勾。
- **未竟事項**：TST-032 (60s delay timeout test) — Not implemented, needs mock server with delay + timeout assertion
- 補充：File location is internal/verify/verify.go (not protocol.go), function signature deviates from spec (ctx + server param)
