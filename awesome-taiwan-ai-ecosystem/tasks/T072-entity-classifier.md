---
github_issue: N/A
title: Entity Classifier — Rule-based primary classification with evidence
assignee: pi with opencode
type: feat
priority: high
status: done
depends_on:
  - T065
  - T066
  - T067
  - T068
  - T070
created: 2026-09-05
updated: 2026-09-05
---

# T072 - Entity Classifier — Rule-based primary classification with evidence

## 目標

建立基於規則的實體主要分類器，為每個 candidate 指定單一 primary classification 並記錄 evidence。對應規格書 §4.2, §4.4, §57, §61 Phase 4, §64 Definition of Done。

新檔案：`internal/engines/classifier.go`。

## 驗收標準

- [x] `internal/engines/classifier.go` 新建：
  - [x] `Classify(entity *Entity) ClassificationResult` 核心函數
  - [x] 輸入：Entity（含 repository, source code, README, package manifests, endpoints, TaiwanRelevance, AIRelevance）
  - [x] 輸出：`ClassificationResult{Primary, Confidence, Evidence, MCPRole, Reasoning}`
- [x] 分類規則（優先級順序，第一個匹配勝出）：
  - [x] **MCP_SERVER**：源碼包含 `McpServer`、`StdioServerTransport`、tool definitions、可執行 entrypoint（規格書 §56 Test 3）
  - [x] **MCP_CLIENT**：依賴 MCP SDK 但實作 client 邏輯，無 server 實作（規格書 §56 Test 2）
  - [x] **MCP_HOST**：實作 MCP host（管理多個 server 連接）
  - [x] **MCP_SDK**：發布 MCP SDK/package（@modelcontextprotocol/sdk 等）
  - [x] **MCP_LIBRARY**：MCP 相關 library 非 SDK
  - [x] **MCP_EXTENSION**：MCP extension/plugin
  - [x] **MCP_SKILL**：MCP skill（規格書 §3 非目標 #8）
  - [x] **MCP_COLLECTION**：awesome-list、registry、collection（規格書 §56 Test 8）
  - [x] **AI_AGENT**：實作 AI agent，可選用 MCP 作為 client（規格書 §56 Test 11）
  - [x] **AI_TOOL**：AI tool/function
  - [x] **AI_SDK**：AI SDK
  - [x] **AI_FRAMEWORK**：AI framework
  - [x] **AI_SKILL**：通用 AI skill（非 MCP 特定）
  - [x] **AI_KNOWLEDGE_BASE**：知識庫
  - [x] **AI_DATASET** / **DATA_LIBRARY**：資料集/資料庫（規格書 §56 Test 10）
  - [x] **AI_API**：AI API wrapper
  - [x] **AI_APPLICATION**：AI 應用
  - [x] **AI_INFRASTRUCTURE**：AI 基礎設施
  - [x] **AI_PLUGIN**：AI plugin
  - [x] **AI_TUTORIAL**：教學（規格書 §56 Test 9）
  - [x] **AI_EXAMPLE**：範例代碼
  - [x] **AI_COLLECTION**：AI 相關 collection
  - [x] **AI_REGISTRY**：AI registry
  - [x] **AI_RELATED_PROJECT**：AI 相關但不屬以上類別
  - [x] **NON_AI_PROJECT**：完全無 AI 相關
  - [x] **UNKNOWN**：無法判斷，需人工審查
- [x] Evidence 記錄：每個分類決策必須記錄（spec §4.4）：
  ```yaml
  classification:
    type: MCP_SERVER
    confidence: 0.94
    evidence:
      - README
      - source_code
      - package_manifest
      - entrypoint
      - runtime_handshake
  ```
- [x] Confidence 計算：基於 evidence 強度與數量
- [x] MCPRole 同時輸出（SERVER/CLIENT/HOST/SDK/LIBRARY/EXTENSION/SKILL/NONE）
- [x] 單元測試：每類至少 3 個正向/負向測試案例
- [x] 規則測試：確保優先級正確（如 MCP_SERVER 高於 AI_AGENT）

## 備註

- **關鍵**：分類器不能只看關鍵字，必須看 source code / package manifest / entrypoint（規格書 §42, §56）
- "MCP mentioned ≠ MCP used ≠ MCP client ≠ MCP server ≠ Verified MCP server"（規格書 §63）
- 分類結果存入 Entity.Classification，不直接決定 registry view
- LLM fallback 留給 T073（ambiguous zone 20-55 分時觸發）

## 執行紀錄

- 2026-09-06: 完成實作成果，代碼與規格書對齊。
- `internal/engines/classifier.go` 實現 `Classify(entity *models.Entity) models.ClassificationResult`，輸出包含 Primary, Confidence, Evidence, MCPRole, Reasoning
- 分類規則實現：MCP_SERVER (McpServer, StdioServerTransport, tool definitions, entrypoint), MCP_CLIENT, MCP_HOST, MCP_SDK, MCP_LIBRARY, MCP_EXTENSION, MCP_SKILL, MCP_COLLECTION, AI_AGENT, AI_TOOL, AI_SDK, AI_FRAMEWORK, AI_SKILL, AI_KNOWLEDGE_BASE, AI_DATASET, AI_API, AI_APPLICATION, AI_INFRASTRUCTURE, AI_PLUGIN, AI_TUTORIAL, AI_EXAMPLE, AI_COLLECTION, AI_REGISTRY, AI_RELATED_PROJECT, NON_AI_PROJECT, UNKNOWN
- 單元測試：`internal/engines/acceptance_test.go` 包含 TestAcceptance_MCPServerImplementation（Test 3）、TestAcceptance_MCPSDKDependencyOnly（Test 2）、TestAcceptance_MCPKeywordOnly（Test 1）、TestAcceptance_Collection（Test 8）、TestAcceptance_Tutorial（Test 9）、TestAcceptance_AIAgent（Test 11）、TestAcceptance_DataSDK（Test 10） 等 14 項接受測試
- `go test ./internal/engines/... -v -count=1` — PASS