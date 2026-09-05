---
github_issue: N/A
title: Entity Classification Enum — Primary classification types (MCP_SERVER, MCP_CLIENT, AI_AGENT, etc.)
assignee: pi
type: feat
priority: high
status: done
depends_on: ["T065"]
created: 2026-09-05
updated: 2026-09-05
---

# T066 - Entity Classification Enum — Primary classification types

## 目標

定義所有主要分類類型的 enum，對應規格書 §2 列表與 §64 Definition of Done。

放置於 `internal/models/classification.go`。

## 驗收標準

- [ ] `PrimaryClassification` string enum 定義（規格書 §2 完整列表）：
  - [ ] `MCP_SERVER`
  - [ ] `MCP_CLIENT`
  - [ ] `MCP_HOST`
  - [ ] `MCP_SDK`
  - [ ] `MCP_LIBRARY`
  - [ ] `MCP_EXTENSION`
  - [ ] `MCP_SKILL`
  - [ ] `MCP_COLLECTION`
  - [ ] `AI_AGENT`
  - [ ] `AI_TOOL`
  - [ ] `AI_SDK`
  - [ ] `AI_FRAMEWORK`
  - [ ] `AI_SKILL`
  - [ ] `AI_KNOWLEDGE_BASE`
  - [ ] `AI_DATASET`
  - [ ] `AI_API`
  - [ ] `AI_APPLICATION`
  - [ ] `AI_INFRASTRUCTURE`
  - [ ] `AI_PLUGIN`
  - [ ] `AI_TUTORIAL`
  - [ ] `AI_EXAMPLE`
  - [ ] `AI_COLLECTION`
  - [ ] `AI_REGISTRY`
  - [ ] `AI_RELATED_PROJECT`
  - [ ] `NON_AI_PROJECT`
  - [ ] `UNKNOWN`
- [ ] `MCPRole` string enum 定義：
  - [ ] `SERVER`, `CLIENT`, `HOST`, `SDK`, `LIBRARY`, `EXTENSION`, `SKILL`, `NONE`
- [ ] `IsMCPRelated(classification PrimaryClassification) bool` helper 函數
- [ ] `IsAIRelated(classification PrimaryClassification) bool` helper 函數
- [ ] `ValidPrimaryClassifications` slice 包含所有有效值
- [ ] `IsValidPrimaryClassification(c string) bool` 驗證函數
- [ ] JSON marshal/unmarshal 測試
- [ ] 單元測試覆蓋所有 enum 值

## 備註

- 這些是「主要分類」，每個 entity 僅有一個 primary classification
- MCP 相關類型（MCP_SERVER, MCP_CLIENT 等）在 MCPRole 中細分
- `AI_SKILL` vs `MCP_SKILL`：MCP_SKILL 是專門給 MCP 生態的 skill，AI_SKILL 是通用 AI skill
- `MCP_COLLECTION` / `AI_COLLECTION` / `AI_REGISTRY`：awesome-lists、registries、collections
- `NON_AI_PROJECT`：完全無 AI 相關的專案
- `UNKNOWN`：需要人工審查

## 執行紀錄

- 待執行