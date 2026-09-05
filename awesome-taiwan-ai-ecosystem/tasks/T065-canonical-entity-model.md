---
github_issue: N/A
title: Canonical Entity Model — Unified entity struct for all AI ecosystem types
assignee: pi
type: feat
priority: high
status: done
depends_on: []
created: 2026-09-05
updated: 2026-09-05
---

# T065 - Canonical Entity Model — Unified entity struct for all AI ecosystem types

## 目標

重構現有的 `MCPServer` 模型，建立統一的 `Entity` 模型，支援規格書 §2 定義的所有實體類型：
- MCP Servers, MCP Clients, MCP Hosts, MCP SDKs, MCP Libraries, MCP Extensions
- AI Agents, AI Tools, AI SDKs, AI Frameworks, AI Skills, AI Knowledge Bases
- AI Datasets, AI APIs, AI Applications, AI Infrastructure, AI Plugins
- AI Tutorials, AI Examples, AI Collections, AI Registries
- AI-related Projects, Non-AI Projects, Unknown / Requires Review

對應規格書 §61 Phase 1, §62 Phase 1, §64 Definition of Done。

演算法參考: [algs/models.md](../algs/models.md) 需更新。

## 驗收標準

- [ ] `internal/models/entity.go` 新建，定義 `Entity` 結構體包含：
  - [ ] `ID` (sha256 hex), `Name`, `Slug`, `Description`
  - [ ] `Classification` 嵌套結構：`Primary` (enum), `Confidence` (float64), `Evidence` ([]Evidence), `MCPRole` (enum: SERVER/CLIENT/HOST/SDK/LIBRARY/EXTENSION/SKILL/NONE)
  - [ ] `TaiwanRelevance` (Score, Level T0-T5, Evidence, Confidence) — 獨立於 MCP
  - [ ] `AIRelevance` (Score, Level, Evidence, Confidence) — 新增，獨立於 MCP
  - [ ] `MCPIdentity` (Status enum: CANDIDATE/STATIC_VERIFIED/RUNTIME_VERIFIED/NOT_MCP, Evidence, Confidence) — 新增
  - [ ] `RuntimeVerification` (Status, InitializeResult, ToolsListResult, Timestamp) — 新增
  - [ ] `SecurityStatus` (Status enum: CLEAN/SUSPICIOUS/QUARANTINED/BLOCKED, Findings, Timestamp) — 新增
  - [ ] `Quality` (Score 0-100, Grade A-F, Components) — 獨立於分類
  - [ ] `Repository` (RepositoryInfo), `Endpoints` ([]Endpoint with Type classification)
  - [ ] `EntityStatus` (enum: DISCOVERED/CANDIDATE/VERIFIED/QUARANTINED/REJECTED) — 新增
  - [ ] `Sources` ([]SourceReference), `FirstSeen`, `LastSeen`, `LastVerified`
- [ ] 所有 enum 使用 string constants (非 iota)
- [ ] 所有時間欄位使用 RFC3339 格式 JSON
- [ ] JSON field names 使用 snake_case
- [ ] 所有 struct 支援 JSON marshal/unmarshal round-trip
- [ ] 單元測試：每個 struct 的 JSON round-trip 測試
- [ ] 現有 `MCPServer` 可透過 `Entity.ToMCPServerView()` 轉換（向後相容）

## 備註

- 這是核心重構，影響所有下游：storage, export, coordinator, CLI
- 原 `internal/models/models.go` 中的 `MCPServer`, `RawCandidate`, `RawRecord` 保留但標記 deprecated，逐步遷移
- Classification evidence 結構參考規格書 §4.4：
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
- MCP identity 與 classification 分離（規格書 §4.3, §45）

## 執行紀錄

- 待執行