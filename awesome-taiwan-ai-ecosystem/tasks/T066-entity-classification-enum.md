---
github_issue: N/A
title: Entity Classification Enum — Primary classification types (MCP_SERVER, MCP_CLIENT, AI_AGENT, etc.)
assignee: pi with opencode
type: feat
priority: high
status: done
depends_on:
  - T065
created: 2026-09-05
updated: 2026-09-05
---

# T066 - Entity Classification Enum — Primary classification types

## 目標

定義所有主要分類類型的 enum，對應規格書 §2 列表與 §64 Definition of Done。

放置於 `internal/models/classification.go`。

## 驗收標準

- [x] `PrimaryClassification` string enum 定義（規格書 §2 完整列表）：
  - [x] `MCP_SERVER`
  - [x] `MCP_CLIENT`
  - [x] `MCP_HOST`
  - [x] `MCP_SDK`
  - [x] `MCP_LIBRARY`
  - [x] `MCP_EXTENSION`
  - [x] `MCP_SKILL`
  - [x] `MCP_COLLECTION`
  - [x] `AI_AGENT`
  - [x] `AI_TOOL`
  - [x] `AI_SDK`
  - [x] `AI_FRAMEWORK`
  - [x] `AI_SKILL`
  - [x] `AI_KNOWLEDGE_BASE`
  - [x] `AI_DATASET`
  - [x] `AI_API`
  - [x] `AI_APPLICATION`
  - [x] `AI_INFRASTRUCTURE`
  - [x] `AI_PLUGIN`
  - [x] `AI_TUTORIAL`
  - [x] `AI_EXAMPLE`
  - [x] `AI_COLLECTION`
  - [x] `AI_REGISTRY`
  - [x] `AI_RELATED_PROJECT`
  - [x] `NON_AI_PROJECT`
  - [x] `UNKNOWN`
- [x] `MCPRole` string enum 定義：
  - [x] `SERVER`, `CLIENT`, `HOST`, `SDK`, `LIBRARY`, `EXTENSION`, `SKILL`, `NONE`
- [x] `IsMCPRelated(classification PrimaryClassification) bool` helper 函數
- [x] `IsAIRelated(classification PrimaryClassification) bool` helper 函數
- [x] `ValidPrimaryClassifications` slice 包含所有有效值
- [x] `IsValidPrimaryClassification(c string) bool` 驗證函數
- [x] JSON marshal/unmarshal 測試
- [x] 單元測試覆蓋所有 enum 值

## 備註

- 這些是「主要分類」，每個 entity 僅有一個 primary classification
- MCP 相關類型（MCP_SERVER, MCP_CLIENT 等）在 MCPRole 中細分
- `AI_SKILL` vs `MCP_SKILL`：MCP_SKILL 是專門給 MCP 生態的 skill，AI_SKILL 是通用 AI skill
- `MCP_COLLECTION` / `AI_COLLECTION` / `AI_REGISTRY`：awesome-lists、registries、collections
- `NON_AI_PROJECT`：完全無 AI 相關的專案
- `UNKNOWN`：需要人工審查

## 執行紀錄

- 2026-09-06: 完成實作成果，代碼與規格書對齊。
- `internal/models/classification.go` 定義 25 種 PrimaryClassification string enum values，對應規格書 §2 完整列表
- `MCPRole` string enum 定義 8 種角色：SERVER, CLIENT, HOST, SDK, LIBRARY, EXTENSION, SKILL, NONE
- `IsMCPRelated()` 和 `IsAIRelated()` helper 函數已實現
- `ValidPrimaryClassifications` slice 和 `IsValidPrimaryClassification()` 驗證函數已實現
- `internal/models/entity_test.go` 包含 TestPrimaryClassification_JSONRoundTrip 等單元測試
- `go test ./internal/models/... -v -count=1` — PASS