---
github_issue: N/A
title: Registry View Generator — taiwan-ai-ecosystem.md, taiwan-mcp.md, taiwan-ai-agents.md, etc.
assignee: pi
type: feat
priority: high
status: done
depends_on: ["T065", "T066", "T067", "T068", "T070", "T072", "T074", "T078", "T079", "T082"]
created: 2026-09-05
updated: 2026-09-05
---

# T083 - Registry View Generator — taiwan-ai-ecosystem.md, taiwan-mcp.md, taiwan-ai-agents.md, etc.

## 目標

建立多視圖 registry 導出器，從同一 Entity 資料庫生成不同視圖。對應規格書 §44, §53, §54, §61 Phase 10, §64 Definition of Done。

新檔案：`internal/export/view_generator.go`，重構現有 `internal/export/exporter.go`。

## 驗收標準

- [x] `internal/export/view_generator.go` 新建：
  - [x] `GenerateViews(entities []*models.Entity, outputDir string) error`
  - [x] 從 Entity 過濾生成 6 個視圖（規格書 §44, §53, §60）：

### 1. taiwan-ai-ecosystem.md / .json
  - [x] 所有 Taiwan AI 實體（TaiwanRelevance.Level >= T1）
  - [x] 分組：MCP, AI, Data, Other（規格書 §60）

### 2. taiwan-mcp.md / .json (Verified MCP Servers)
  - [x] 條件：`Classification.Primary == MCP_SERVER` AND `MCPIdentity.Status == RUNTIME_VERIFIED` AND `TaiwanRelevance.Level >= T1` AND `SecurityStatus != BLOCKED`
  - [x] 對應規格書 §44 "MCP Servers", §54

### 3. taiwan-mcp-candidates.md / .json
  - [x] 條件：`Classification.Primary == MCP_SERVER` AND `MCPIdentity.Status IN (CANDIDATE, STATIC_VERIFIED)`
  - [x] 對應規格書 §44 "MCP Candidates"

### 4. taiwan-ai-agents.md / .json
  - [x] 條件：`Classification.Primary == AI_AGENT` AND `TaiwanRelevance.Level >= T1`

### 5. taiwan-ai-tools.md / .json
  - [x] 條件：`Classification.Primary IN (AI_TOOL, AI_SDK, AI_FRAMEWORK, AI_PLUGIN)` AND `TaiwanRelevance.Level >= T1`

### 6. taiwan-ai-data.md / .json
  - [x] 條件：`Classification.Primary IN (AI_DATASET, DATA_LIBRARY, AI_KNOWLEDGE_BASE, AI_API)` AND `TaiwanRelevance.Level >= T1`

- [x] 額外視圖（規格書 §53, §60）：
  - [x] `taiwan-ai-skills.md` (AI_SKILL, MCP_SKILL)
  - [x] `taiwan-ai-infrastructure.md` (AI_INFRASTRUCTURE)
  - [x] `taiwan-ai-tutorials.md` (AI_TUTORIAL, AI_EXAMPLE)
  - [x] `taiwan-ai-collections.md` (AI_COLLECTION, AI_REGISTRY, MCP_COLLECTION)
- [x] JSON 輸出：schema version, generated_at, entities array
- [x] Markdown 輸出：分組、表格、統計摘要
- [x] 向後相容：保留 `awesome-taiwan-mcp.md` 生成（規格書 §53）
- [x] 單元測試：各視圖過濾邏輯、輸出格式
- [x] 整合測試：完整 pipeline 生成所有視圖

## 備註

- 規格書 §53：現有 MCP registry output 成為 generated view
- 新 canonical database: `taiwan_ai_ecosystem`
- 視圖生成純屬過濾，不修改 Entity 數據

## 執行紀錄

- 已完成：`internal/export/view_generator.go`（10 views, GenerateViews, JSON+Markdown output）
- 已完成：`internal/export/view_generator_test.go`（13 tests，全部通過）
- 執行 `go test ./internal/export/... -v -count=1 -timeout 30s` — PASS