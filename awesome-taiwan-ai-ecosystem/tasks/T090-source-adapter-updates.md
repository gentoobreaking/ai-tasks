---
github_issue: N/A
title: Source Adapter Updates — Treat registries as discovery sources, not proof
assignee: pi
type: feat
priority: high
status: pending
depends_on: ["T089"]
created: 2026-09-05
updated: 2026-09-05
---

# T090 - Source Adapter Updates — Treat registries as discovery sources, not proof

## 目標

更新所有 source adapter，實現規格書 §5, §207-211：外部註冊表僅作發現源，非權威證明。

修改：`internal/sources/github/`, `internal/sources/registry/`, `internal/sources/mcpserversorg/`, `internal/sources/mcpmarket/`, `internal/sources/githubrepo/`。

## 驗收標準

- [ ] 所有 Adapter 的 `Discover()` 回傳 `RawCandidate`，包含：
  - [ ] `Source`：來源名稱
  - [ ] `SourceURL`：來源中的條目 URL
  - [ ] `RepositoryURL`：GitHub repo URL（關鍵：從 registry 條目中提取）
  - [ ] `RawMetadata`：原始 metadata 保留
- [ ] 所有 Adapter 的 `Fetch()` 從 **RepositoryURL** 獲取完整資料（GitHub API, source code 等），**不信任** registry 提供的 description, endpoints, tools 等
- [ ] `SourceReference.TrustScore` 設置（規格書 §64）：
  - [ ] GitHub: 0.95（主要源碼證據）
  - [ ] Official MCP Registry: 0.90（高信任發現 metadata）
  - [ ] Glama: 0.85
  - [ ] PulseMCP: 0.80
  - [ ] MCP.so: 0.75
  - [ ] MCPMarket: 0.70
- [ ] Registry adapters 不再嘗試解析 endpoints 作為 MCP runtime endpoint
- [ ] 去除舊代碼中「registry listing 即為 MCP server 證明」的邏輯
- [ ] 單元測試：每個 adapter 的 Discover/Fetch 行為
- [ ] 整合測試：同一 repo 從多源發現 → 正確去重（T011 dedup）

## 備註

- 規格書 §207: "The system SHALL treat external registries as discovery sources, not authoritative proof"
- 規格書 §209: "an MCP directory can identify a candidate, but the candidate's actual repository/runtime still needs independent classification"
- 現有 adapter 可能有將 registry 提供的 endpoint 直接存入的邏輯，必須移除

## 執行紀錄

- 待執行