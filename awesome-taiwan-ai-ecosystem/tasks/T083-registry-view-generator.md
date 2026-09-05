---
github_issue: N/A
title: Registry View Generator — taiwan-ai-ecosystem.md, taiwan-mcp.md, taiwan-ai-agents.md, etc.
assignee: pi
type: feat
priority: high
status: pending
depends_on: ["T065", "T066", "T067", "T068", "T070", "T072", "T074", "T078", "T079", "T082"]
created: 2026-09-05
updated: 2026-09-05
---

# T083 - Registry View Generator — taiwan-ai-ecosystem.md, taiwan-mcp.md, taiwan-ai-agents.md, etc.

## 目標

建立多視圖 registry 導出器，從同一 Entity 資料庫生成不同視圖。對應規格書 §44, §53, §54, §61 Phase 10, §64 Definition of Done。

新檔案：`internal/export/view_generator.go`，重構現有 `internal/export/exporter.go`。

## 驗收標準

- [ ] `internal/export/view_generator.go` 新建：
  - [ ] `GenerateViews(entities []*Entity, outputDir string) error`
  - [ ] 從 Entity 過濾生成 6 個視圖（規格書 §44, §53, §60）：

### 1. taiwan-ai-ecosystem.md / .json
  - [ ] 所有 Taiwan AI 實體（TaiwanRelevance.Level >= T1）
  - [ ] 分組：MCP, AI, Data, Other（規格書 §60）

### 2. taiwan-mcp.md / .json (Verified MCP Servers)
  - [ ] 條件：`Classification.Primary == MCP_SERVER` AND `MCPIdentity.Status == RUNTIME_VERIFIED` AND `TaiwanRelevance.Level >= T1` AND `SecurityStatus != BLOCKED`
  - [ ] 對應規格書 §44 "MCP Servers", §54

### 3. taiwan-mcp-candidates.md / .json
  - [ ] 條件：`Classification.Primary == MCP_SERVER` AND `MCPIdentity.Status IN (CANDIDATE, STATIC_VERIFIED)`
  - [ ] 對應規格書 §44 "MCP Candidates"

### 4. taiwan-ai-agents.md / .json
  - [ ] 條件：`Classification.Primary == AI_AGENT` AND `TaiwanRelevance.Level >= T1`

### 5. taiwan-ai-tools.md / .json
  - [ ] 條件：`Classification.Primary IN (AI_TOOL, AI_SDK, AI_FRAMEWORK, AI_PLUGIN)` AND `TaiwanRelevance.Level >= T1`

### 6. taiwan-ai-data.md / .json
  - [ ] 條件：`Classification.Primary IN (AI_DATASET, DATA_LIBRARY, AI_KNOWLEDGE_BASE, AI_API)` AND `TaiwanRelevance.Level >= T1`

- [ ] 額外視圖（規格書 §53, §60）：
  - [ ] `taiwan-ai-skills.md` (AI_SKILL, MCP_SKILL)
  - [ ] `taiwan-ai-infrastructure.md` (AI_INFRASTRUCTURE)
  - [ ] `taiwan-ai-tutorials.md` (AI_TUTORIAL, AI_EXAMPLE)
  - [ ] `taiwan-ai-collections.md` (AI_COLLECTION, AI_REGISTRY, MCP_COLLECTION)
- [ ] JSON 輸出：schema version, generated_at, entities array
- [ ] Markdown 輸出：分組、表格、統計摘要
- [ ] 向後相容：保留 `awesome-taiwan-mcp.md` 生成（規格書 §53）
- [ ] 單元測試：各視圖過濾邏輯、輸出格式
- [ ] 整合測試：完整 pipeline 生成所有視圖

## 備註

- 規格書 §53：現有 MCP registry output 成為 generated view
- 新 canonical database: `taiwan_ai_ecosystem`
- 視圖生成純屬過濾，不修改 Entity 數據

## 執行紀錄

- 待執行