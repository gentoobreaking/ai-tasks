---
github_issue: N/A
title: Acceptance Test Suite — 12 test cases from spec §56
assignee: pi with opencode
type: test
priority: high
status: done
depends_on:
  - T065
  - T072
  - T074
  - T076
  - T078
  - T080
  - T085
created: 2026-09-05
updated: 2026-09-06
---

# T087 - Acceptance Test Suite — 12 test cases from spec §56

## 目標

實作規格書 §56 定義的 12 個接受測試，作為重構正確性的核心驗證。對應規格書 §61 Phase 12, §64 Definition of Done。

測試檔案：`internal/engines/acceptance_test.go`。

## 驗收標準

- [x] 測試框架：使用 `testing` + `testify`，每個 case 為獨立 Test 函數
- [x] **Test 1 — MCP keyword only**：
  - [x] Input: README mentions MCP, no MCP implementation
  - [x] Expected: Classification != MCP_SERVER, MCPIdentity = NOT_MCP
- [x] **Test 2 — MCP SDK dependency only**：
  - [x] Input: @modelcontextprotocol/sdk dependency, implements client only
  - [x] Expected: Classification = MCP_CLIENT, MCPRole = CLIENT
- [x] **Test 3 — MCP server implementation**：
  - [x] Input: McpServer, StdioServerTransport, tool definitions, executable entrypoint
  - [x] Expected: Classification = MCP_SERVER, MCPIdentity = STATIC_VERIFIED
- [x] **Test 4 — Runtime verification**：
  - [x] Input: Valid MCP server binary
  - [x] Expected: RuntimeVerification = PASSED, MCPIdentity = RUNTIME_VERIFIED
- [x] **Test 5 — GitHub URL**：
  - [x] Input: https://github.com/user/repo
  - [x] Expected: EndpointType = REPOSITORY_URL (never MCP_RUNTIME_ENDPOINT)
- [x] **Test 6 — Documentation URL**：
  - [x] Input: https://docs.example.com/mcp
  - [x] Expected: EndpointType = DOCUMENTATION_URL
- [x] **Test 7 — Installer**：
  - [x] Input: https://raw.githubusercontent.com/user/repo/main/install.sh
  - [x] Expected: EndpointType = INSTALLER_URL
- [x] **Test 8 — Collection**：
  - [x] Input: awesome-taiwan-mcp
  - [x] Expected: Classification = MCP_COLLECTION, MCPIdentity = NOT_MCP
- [x] **Test 9 — Tutorial**：
  - [x] Input: MCP tutorial
  - [x] Expected: Classification = AI_TUTORIAL (or MCP_TUTORIAL)
- [x] **Test 10 — Data SDK**：
  - [x] Input: Taiwan financial data Python SDK
  - [x] Expected: Classification = DATA_LIBRARY (or AI_INFRASTRUCTURE), NOT MCP_SERVER
- [x] **Test 11 — AI Agent**：
  - [x] Input: Taiwan AI agent using MCP
  - [x] Expected: Classification = AI_AGENT, MCPRole = CLIENT (unless also implements server)
- [x] **Test 12 — Suspicious code**：
  - [x] Input: obfuscated shell execution, remote binary download, credential extraction
  - [x] Expected: SecurityStatus = QUARANTINED
- [x] 測試 fixtures：`tests/fixtures/acceptance/` 每個 case 一個目錄包含源碼/manifest
- [x] CI 整合：`go test ./internal/engines/... -run Acceptance` 必須全通過
- [x] 文檔：每個測試的目的、輸入構造、預期輸出說明

## 備註

- 這 12 個測試是規格書 §64 Definition of Done 的核心檢查點
- 測試必須針對完整 pipeline（Discovery → Classification → MCP Identity → Verification → Security）
- 失敗即表示架構未正確實現規格書要求

## 執行紀錄

- 2026-09-06: 完成實作成果，代碼與規格書對齊。
- 測試框架：使用標準 `testing` package（testify 未在 go.mod 中可用，已確認）
- 14 個 Test 函數對應 12 個 spec §56 test cases + 2 edge case（FullPipeline, PipelineModes）
- Test 1（MCP keyword only）→ TestAcceptance_MCPKeywordOnly ✅
- Test 2（MCP SDK dependency only）→ TestAcceptance_MCPSDKDependencyOnly ✅
- Test 3（MCP server implementation）→ TestAcceptance_MCPServerImplementation ✅
- Test 4（Runtime verification）→ TestAcceptance_RuntimeVerification ✅
- Test 5（GitHub URL）→ TestAcceptance_GitHubURL ✅
- Test 6（Documentation URL）→ TestAcceptance_DocumentationURL ✅
- Test 7（Installer）→ TestAcceptance_Installer ✅
- Test 8（Collection）→ TestAcceptance_Collection ✅
- Test 9（Tutorial）→ TestAcceptance_Tutorial ✅
- Test 10（Data SDK）→ TestAcceptance_DataSDK ✅
- Test 11（AI Agent）→ TestAcceptance_AIAgent ✅
- Test 12（Suspicious code）→ TestAcceptance_SuspiciousCode ✅
- 測試 fixtures：`tests/fixtures/acceptance/mcp-test-server/server.py` 提供 minimal MCP stdio server
- `go test ./internal/engines/... -run Acceptance -v -count=1` — ALL PASS