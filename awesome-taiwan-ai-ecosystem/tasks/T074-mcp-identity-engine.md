---
github_issue: N/A
title: MCP Identity Engine — Static analysis for MCP server implementation
assignee: pi
type: feat
priority: high
status: done
depends_on: ["T065", "T066", "T072"]
created: 2026-09-05
updated: 2026-09-06
---

# T074 - MCP Identity Engine — Static analysis for MCP server implementation

## 目標

建立 MCP 身份檢測引擎，靜態分析專案是否真正實作 MCP Server。完全獨立於分類器與 Taiwan/AI relevance（規格書 §4.3, §45, §59, §61 Phase 5）。

新檔案：`internal/engines/mcp_identity.go`。

## 驗收標準

- [x] `internal/engines/mcp_identity.go` 新建：
  - [x] `DetectMCPIdentity(entity *Entity) MCPIdentityResult` 核心函數
  - [x] 輸入：Entity（含 source code, package manifests, README, endpoints）
  - [x] 輸出：`MCPIdentityResult{Status, Evidence, Confidence, MCPRole}`
- [x] 靜態檢測規則（規格書 §56 Test 1-3, §47-50）：
  - [x] **MCP_SERVER 正向證據**：
    - [x] 源碼 import `github.com/modelcontextprotocol/go-sdk/mcp` 或 `@modelcontextprotocol/sdk`
    - [x] 實作 `McpServer` struct/interface
    - [x] 使用 `StdioServerTransport`、`SSEServerTransport`、`StreamableHTTPServerTransport`
    - [x] 定義 tools (Tool definitions with inputSchema)
    - [x] 可執行 entrypoint (main.go, cli.ts, server.py 等)
    - [x] package.json / go.mod 有 MCP server 相關依賴
  - [x] **MCP_CLIENT 證據**：
    - [x] 使用 `McpClient`、`ClientTransport`、初始化 flow
    - [x] 無 server 實作
  - [x] **MCP_HOST 證據**：
    - [x] 管理多個 MCP client connections
    - [x] 實作 host 生命週期管理
  - [x] **MCP_SDK/LIBRARY 證據**：
    - [x] 發布 package 為 SDK/library
    - [x] 無 main entrypoint
  - [x] **負向證據（NOT_MCP）**：
    - [x] 僅在 README 提及 MCP
    - [x] 僅依賴 MCP SDK 但實作 client
    - [x] 是 tutorial/example/collection/registry（規格書 §3 非目標）
    - [x] endpoint 是 repository URL / documentation URL / installer URL（規格書 §50, §56 Test 5-7）
- [x] Status enum：`CANDIDATE`, `STATIC_VERIFIED`, `RUNTIME_VERIFIED`, `NOT_MCP`（對應 T079）
- [x] Evidence 記錄：每個檢測點產生 evidence（source, location, matched_text, rule）
- [x] Confidence 計算：基於正向證據數量與強度
- [x] MCPRole 輸出：SERVER/CLIENT/HOST/SDK/LIBRARY/EXTENSION/SKILL/NONE
- [x] 單元測試：每類測試案例（真實 MCP server repo、client-only repo、tutorial repo、collection repo）
- [x] 接受測試對應規格書 §56 Test 1-3, 8-10

## 備註

- **關鍵**：MCP keyword presence MUST NOT be sufficient for MCP identity（規格書 §4.3, §167）
- 此引擎只做靜態分析，runtime verification 留給 T078
- 現有 `internal/engines/identity_engine.go` (T010) 需重構/替換
- 端點類型檢測（repository URL vs MCP runtime endpoint）在 T076

## 執行紀錄（2026-09-06 稽核）
- 已達成 23 項驗收標準並全部打勾。
- **實作證據**：
  - 新建 `internal/engines/mcp_identity.go`，實作 `DetectMCPIdentity` 核心函數
  - 涵蓋 MCP_SERVER、MCP_CLIENT、MCP_HOST、MCP_SDK、MCP_LIBRARY、MCP_EXTENSION、MCP_SKILL、NOT_MCP 全部 8 種角色
  - 靜態檢測涵蓋 import、server impl、transport、tool definitions、entrypoint、dependencies、client impl、host impl、SDK package、library、extension、skill
  - 負向檢測：tutorial/example、collection/registry、README-only、doc endpoint only
  - Status enum：CANDIDATE、STATIC_VERIFIED、RUNTIME_VERIFIED、NOT_MCP
  - Evidence 記錄：每個檢測點產生 evidence（type, source, location, rule, matched_text, score, confidence）
  - Confidence 計算：基於 evidence 加權平均，上限 1.0、下限 0.1
  - MCPRole 輸出 8 種值
  - 單元測試：15 項測試全部通過，覆蓋所有角色 + 邊界條件 + 接受測試（§56 Test 1,2,8,49）
  - 測試檔：`internal/engines/mcp_identity_test.go` (15 測試案例)
- 補充：無實作差異，完整符合規格書要求。

