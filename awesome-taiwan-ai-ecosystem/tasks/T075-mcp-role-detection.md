---
github_issue: N/A
title: MCP Role Detection — CLIENT, HOST, SDK, SKILL, EXTENSION separation
assignee: pi
type: feat
priority: high
status: pending
depends_on: ["T074"]
created: 2026-09-05
updated: 2026-09-05
---

# T075 - MCP Role Detection — CLIENT, HOST, SDK, SKILL, EXTENSION separation

## 目標

細分 MCP 相關專案的具體角色，避免全部歸類為 MCP_SERVER。對應規格書 §2, §3 非目標 #7-9, §47, §61 Phase 5。

整合在 `internal/engines/mcp_identity.go` (T074) 中，輸出 `MCPRole` enum。

## 驗收標準

- [ ] `MCPRole` enum（已在 T066 定義）：`SERVER`, `CLIENT`, `HOST`, `SDK`, `LIBRARY`, `EXTENSION`, `SKILL`, `NONE`
- [ ] 檢測規則：
  - [ ] **SERVER**：實作 MCP server (T074 已涵蓋)
  - [ ] **CLIENT**：實作 MCP client，連接外部 server（`McpClient`、初始化、tool calling）
  - [ ] **HOST**：管理多個 MCP server 連接、生命週期、routing
  - [ ] **SDK**：發布官方/第三方 MCP SDK（package name 含 sdk、提供 client/server base class）
  - [ ] **LIBRARY**：MCP 相關 utility library（helpers, parsers, validators）
  - [ ] **EXTENSION**：MCP protocol extension（custom transport, auth, middleware）
  - [ ] **SKILL**：MCP skill（給 MCP client/host 使用的技能包，規格書 §3 #8）
  - [ ] **NONE**：非 MCP 相關
- [ ] 多角色支援：專案可能同時是 SDK + EXTENSION，輸出 primary role + secondary roles
- [ ] Evidence 記錄每個 role 的判斷依據
- [ ] 整合到 MCPIdentityResult
- [ ] 單元測試：各 role 代表性專案測試
- [ ] 接受測試對應規格書 §56 Test 2 (MCP_CLIENT), §47 (MCP_COLLECTION), §49 (AI_AGENT with MCP_CLIENT role)

## 備註

- 規格書 §3 非目標 #7：消費 MCP server 的應用 ≠ MCP server
- 規格書 §3 非目標 #8：MCP skill ≠ MCP server
- 規格書 §3 非目標 #9：MCP collection/awesome-list ≠ MCP server
- 規格書 §49：AI agent 使用 MCP → role = CLIENT，除非 agent 本身也 expose MCP server
- MCPRole 獨立於 PrimaryClassification（一個 AI_AGENT 可能有 MCPRole = CLIENT）

## 執行紀錄

- 待執行