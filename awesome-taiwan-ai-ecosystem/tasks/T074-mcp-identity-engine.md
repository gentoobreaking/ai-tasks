---
github_issue: N/A
title: MCP Identity Engine — Static analysis for MCP server implementation
assignee: pi
type: feat
priority: high
status: pending
depends_on: ["T065", "T066", "T072"]
created: 2026-09-05
updated: 2026-09-05
---

# T074 - MCP Identity Engine — Static analysis for MCP server implementation

## 目標

建立 MCP 身份檢測引擎，靜態分析專案是否真正實作 MCP Server。完全獨立於分類器與 Taiwan/AI relevance（規格書 §4.3, §45, §59, §61 Phase 5）。

新檔案：`internal/engines/mcp_identity.go`。

## 驗收標準

- [ ] `internal/engines/mcp_identity.go` 新建：
  - [ ] `DetectMCPIdentity(entity *Entity) MCPIdentityResult` 核心函數
  - [ ] 輸入：Entity（含 source code, package manifests, README, endpoints）
  - [ ] 輸出：`MCPIdentityResult{Status, Evidence, Confidence, MCPRole}`
- [ ] 靜態檢測規則（規格書 §56 Test 1-3, §47-50）：
  - [ ] **MCP_SERVER 正向證據**：
    - [ ] 源碼 import `github.com/modelcontextprotocol/go-sdk/mcp` 或 `@modelcontextprotocol/sdk`
    - [ ] 實作 `McpServer` struct/interface
    - [ ] 使用 `StdioServerTransport`、`SSEServerTransport`、`StreamableHTTPServerTransport`
    - [ ] 定義 tools (Tool definitions with inputSchema)
    - [ ] 可執行 entrypoint (main.go, cli.ts, server.py 等)
    - [ ] package.json / go.mod 有 MCP server 相關依賴
  - [ ] **MCP_CLIENT 證據**：
    - [ ] 使用 `McpClient`、`ClientTransport`、初始化 flow
    - [ ] 無 server 實作
  - [ ] **MCP_HOST 證據**：
    - [ ] 管理多個 MCP client connections
    - [ ] 實作 host 生命週期管理
  - [ ] **MCP_SDK/LIBRARY 證據**：
    - [ ] 發布 package 為 SDK/library
    - [ ] 無 main entrypoint
  - [ ] **負向證據（NOT_MCP）**：
    - [ ] 僅在 README 提及 MCP
    - [ ] 僅依賴 MCP SDK 但實作 client
    - [ ] 是 tutorial/example/collection/registry（規格書 §3 非目標）
    - [ ] endpoint 是 repository URL / documentation URL / installer URL（規格書 §50, §56 Test 5-7）
- [ ] Status enum：`CANDIDATE`, `STATIC_VERIFIED`, `RUNTIME_VERIFIED`, `NOT_MCP`（對應 T079）
- [ ] Evidence 記錄：每個檢測點產生 evidence（source, location, matched_text, rule）
- [ ] Confidence 計算：基於正向證據數量與強度
- [ ] MCPRole 輸出：SERVER/CLIENT/HOST/SDK/LIBRARY/EXTENSION/SKILL/NONE
- [ ] 單元測試：每類測試案例（真實 MCP server repo、client-only repo、tutorial repo、collection repo）
- [ ] 接受測試對應規格書 §56 Test 1-3, 8-10

## 備註

- **關鍵**：MCP keyword presence MUST NOT be sufficient for MCP identity（規格書 §4.3, §167）
- 此引擎只做靜態分析，runtime verification 留給 T078
- 現有 `internal/engines/identity_engine.go` (T010) 需重構/替換
- 端點類型檢測（repository URL vs MCP runtime endpoint）在 T076

## 執行紀錄

- 待執行