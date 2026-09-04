---
github_issue: N/A
title: MCP Protocol Verification — initialize, tools/list, resources/list, prompts/list
type: feat
priority: high
^status: done
depends_on: [T002]
assignee: agent
created: 2026-09-05
updated: 2026-09-05
---

# T022 - MCP Protocol Verification — initialize, tools/list, resources/list, prompts/list

## 目標

建立 `internal/verify/protocol.go`, 通過 MCP protocol 驗證 server 健康狀況。
對應 CRAWLER_AGENT_TASKS.md §24 TASK-024, §25 Verification Engine, §28 Tool Discovery。

演算法參考: [algs/verification.md](../algs/verification.md) §Sub-system 3

## 驗收標準

- [ ] `internal/verify/protocol.go` 建立
- [ ] `VerifyMCPProtocol(endpoint *Endpoint) ProtocolVerificationResult` 函數實現
- [ ] 只允許 protocol-level communication, 絕對不能 execute tool (§TASK-024: 禁止 execute tool)
- [ ] 發送 `initialize` 請求 → 收到 valid MCP response
- [ ] 解析 initialize response 中的 protocolVersion 和 capabilities
- [ ] 發送 `tools/list` 請求 → 收到 tools array
- [ ] 發送 `resources/list` 請求 → 收到 resources array (如果 supported)
- [ ] 發送 `prompts/list` 請求 → 收到 prompts array (如果 supported)
- [ ] Extract 所有 tools: name, description, input_schema, annotations (§28)
- [ ] Extract 所有 resources: uri, name, description, mime_type
- [ ] Extract 所有 prompts: name, description
- [ ] 單元測試: mock MCP server 回傳 valid initialize response → HTTP success, valid MCP response, protocol version accepted, server capabilities parsed (§TST-027)
- [ ] 單元測試: mock server 回傳 10 tools → database 存入 10 tools, 每 tool name != empty, description != empty OR explicitly allowed, input_schema valid (§TST-028)
- [ ] 單元測試: mock server 回傳 5 resources → registry 存入 5 resources, 數量完全一致 (§TST-029)
- [ ] 單元測暗: mock server 回傳 3 prompts → registry 存入 3 prompts (§TST-030)
- [ ] 單元測試: invalid JSON 回應 → crawler does not panic, health != HEALTHY, record remains valid (§TST-031)
- [ ] 單元測試: response delay = 60s, crawler timeout <= 10s → request terminated <= timeout+1s, crawl continues, health = UNAVAILABLE (§TST-032)

## 備註

- MCP protocol handshake 使用 Streamable HTTP / SSE transport
- 不得 execute discovered MCP code (§58 Security KPI)
- Transport type detection: stdio, sse, streamable-http, http, websocket (§8 Endpoint Schema)
