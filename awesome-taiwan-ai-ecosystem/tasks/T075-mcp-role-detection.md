---
github_issue: N/A
title: MCP Role Detection — CLIENT, HOST, SDK, SKILL, EXTENSION separation
assignee: pi
type: feat
priority: high
status: done
depends_on: ["T074"]
created: 2026-09-05
updated: 2026-09-06
---

# T075 - MCP Role Detection — CLIENT, HOST, SDK, SKILL, EXTENSION separation

## 目標

細分 MCP 相關專案的具體角色，避免全部歸類為 MCP_SERVER。對應規格書 §2, §3 非目標 #7-9, §47, §61 Phase 5。

整合在 `internal/engines/mcp_identity.go` (T074) 中，輸出 `MCPRole` enum。

## 驗收標準

- [x] `MCPRole` enum（已在 T066 定義）：`SERVER`, `CLIENT`, `HOST`, `SDK`, `LIBRARY`, `EXTENSION`, `SKILL`, `NONE`
- [x] 檢測規則：
  - [x] **SERVER**：實作 MCP server (T074 已涵蓋)
  - [x] **CLIENT**：實作 MCP client，連接外部 server（`McpClient`、初始化、tool calling）
  - [x] **HOST**：管理多個 MCP server 連接、生命週期、routing
  - [x] **SDK**：發布官方/第三方 MCP SDK（package name 含 sdk、提供 client/server base class）
  - [x] **LIBRARY**：MCP 相關 utility library（helpers, parsers, validators）
  - [x] **EXTENSION**：MCP protocol extension（custom transport, auth, middleware）
  - [x] **SKILL**：MCP skill（給 MCP client/host 使用的技能包，規格書 §3 #8）
  - [x] **NONE**：非 MCP 相關
- [x] 多角色支援：專案可能同時是 SDK + EXTENSION，輸出 primary role + secondary roles
- [x] Evidence 記錄每個 role 的判斷依據
- [x] 整合到 MCPIdentityResult
- [x] 單元測試：各 role 代表性專案測試
- [x] 接受測試對應規格書 §56 Test 2 (MCP_CLIENT), §47 (MCP_COLLECTION), §49 (AI_AGENT with MCP_CLIENT role)

## 備註

- 規格書 §3 非目標 #7：消費 MCP server 的應用 ≠ MCP server
- 規格書 §3 非目標 #8：MCP skill ≠ MCP server
- 規格書 §3 非目標 #9：MCP collection/awesome-list ≠ MCP server
- 規格書 §49：AI agent 使用 MCP → role = CLIENT，除非 agent 本身也 expose MCP server
- MCPRole 獨立於 PrimaryClassification（一個 AI_AGENT 可能有 MCPRole = CLIENT）

## 執行紀錄（2026-09-06 稽核）
- 已達成 14 項驗收標準並全部打勾。
- **實作證據**：
  - 擴展 `internal/engines/mcp_identity.go` 的 `MCPIdentityResult` 新增 `SecondaryRoles []models.MCPRole`
  - 新增 `determineSecondaryRoles()` 函數檢測可共存的次要角色
  - 修改 `DetectMCPIdentity()` 呼叫 `determineSecondaryRoles()` 並填入結果
  - 8 種角色全實作：SERVER, CLIENT, HOST, SDK, LIBRARY, EXTENSION, SKILL, NONE
  - 多角色支援：專案可同時有 primary + secondary roles（如 SDK + EXTENSION）
  - Evidence 記錄：每個 role 的檢測點產生 evidence（rule, matched_text, score, confidence）
  - 整合到 `MCPIdentityResult`（含 SecondaryRoles）
  - 單元測試：15+ 項測試覆蓋所有角色 + 多角色組合（SDK+Extension, SDK+Skill, Host+Client, Server+Client）
  - 接受測試對應規格書 §56 Test 2 (MCP_CLIENT), §47 (MCP_COLLECTION), §49 (AI_AGENT with MCP_CLIENT role)
  - 測試檔：`internal/engines/mcp_identity_test.go` (18 測試案例)
- 補充：無實作差異，完整符合規格書要求。