---
github_issue: N/A
title: Acceptance Test Suite — 12 test cases from spec §56
assignee: pi
type: test
priority: high
status: pending
depends_on: ["T065", "T072", "T074", "T076", "T078", "T080", "T085"]
created: 2026-09-05
updated: 2026-09-05
---

# T087 - Acceptance Test Suite — 12 test cases from spec §56

## 目標

實作規格書 §56 定義的 12 個接受測試，作為重構正確性的核心驗證。對應規格書 §61 Phase 12, §64 Definition of Done。

測試檔案：`internal/engines/acceptance_test.go`。

## 驗收標準

- [ ] 測試框架：使用 `testing` + `testify`，每個 case 為獨立 Test 函數
- [ ] **Test 1 — MCP keyword only**：
  - [ ] Input: README mentions MCP, no MCP implementation
  - [ ] Expected: Classification != MCP_SERVER, MCPIdentity = NOT_MCP
- [ ] **Test 2 — MCP SDK dependency only**：
  - [ ] Input: @modelcontextprotocol/sdk dependency, implements client only
  - [ ] Expected: Classification = MCP_CLIENT, MCPRole = CLIENT
- [ ] **Test 3 — MCP server implementation**：
  - [ ] Input: McpServer, StdioServerTransport, tool definitions, executable entrypoint
  - [ ] Expected: Classification = MCP_SERVER, MCPIdentity = STATIC_VERIFIED
- [ ] **Test 4 — Runtime verification**：
  - [ ] Input: Valid MCP server binary
  - [ ] Expected: RuntimeVerification = PASSED, MCPIdentity = RUNTIME_VERIFIED
- [ ] **Test 5 — GitHub URL**：
  - [ ] Input: https://github.com/user/repo
  - [ ] Expected: EndpointType = REPOSITORY_URL (never MCP_RUNTIME_ENDPOINT)
- [ ] **Test 6 — Documentation URL**：
  - [ ] Input: https://docs.example.com/mcp
  - [ ] Expected: EndpointType = DOCUMENTATION_URL
- [ ] **Test 7 — Installer**：
  - [ ] Input: https://raw.githubusercontent.com/user/repo/main/install.sh
  - [ ] Expected: EndpointType = INSTALLER_URL
- [ ] **Test 8 — Collection**：
  - [ ] Input: awesome-taiwan-mcp
  - [ ] Expected: Classification = MCP_COLLECTION, MCPIdentity = NOT_MCP
- [ ] **Test 9 — Tutorial**：
  - [ ] Input: MCP tutorial
  - [ ] Expected: Classification = AI_TUTORIAL (or MCP_TUTORIAL)
- [ ] **Test 10 — Data SDK**：
  - [ ] Input: Taiwan financial data Python SDK
  - [ ] Expected: Classification = DATA_LIBRARY (or AI_INFRASTRUCTURE), NOT MCP_SERVER
- [ ] **Test 11 — AI Agent**：
  - [ ] Input: Taiwan AI agent using MCP
  - [ ] Expected: Classification = AI_AGENT, MCPRole = CLIENT (unless also implements server)
- [ ] **Test 12 — Suspicious code**：
  - [ ] Input: obfuscated shell execution, remote binary download, credential extraction
  - [ ] Expected: SecurityStatus = QUARANTINED
- [ ] 測試 fixtures：`tests/fixtures/acceptance/` 每個 case 一個目錄包含源碼/manifest
- [ ] CI 整合：`go test ./internal/engines/... -run Acceptance` 必須全通過
- [ ] 文檔：每個測試的目的、輸入構造、預期輸出說明

## 備註

- 這 12 個測試是規格書 §64 Definition of Done 的核心檢查點
- 測試必須針對完整 pipeline（Discovery → Classification → MCP Identity → Verification → Security）
- 失敗即表示架構未正確實現規格書要求

## 執行紀錄

- 待執行