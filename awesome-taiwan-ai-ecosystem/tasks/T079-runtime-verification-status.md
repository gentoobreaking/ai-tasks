---
github_issue: N/A
title: Runtime Verification Status — MCP_CANDIDATE, MCP_STATIC_VERIFIED, MCP_RUNTIME_VERIFIED, NOT_MCP
assignee: pi
type: feat
priority: high
status: pending
depends_on: ["T074", "T078"]
created: 2026-09-05
updated: 2026-09-05
---

# T079 - Runtime Verification Status — MCP_CANDIDATE, MCP_STATIC_VERIFIED, MCP_RUNTIME_VERIFIED, NOT_MCP

## 目標

定義 MCP 身份驗證狀態機，明確區分靜態分析通過與運行時驗證通過。對應規格書 §55, §59, §61 Phase 7。

整合在 `internal/models/mcp_identity.go` (T065/T074 相關) 和 `internal/engines/runtime_verifier.go` (T078)。

## 驗收標準

- [ ] `MCPIdentityStatus` enum（在 `internal/models/mcp_identity.go`）：
  - [ ] `CANDIDATE` — 發現階段，疑似 MCP 相關，待靜態分析
  - [ ] `STATIC_VERIFIED` — 靜態分析確認有 MCP server 實作代碼（T074）
  - [ ] `RUNTIME_VERIFIED` — 運行時 handshake 通過（T078）
  - [ ] `NOT_MCP` — 確認非 MCP server（tutorial, client-only, collection 等）
- [ ] 狀態轉換規則：
  - [ ] CANDIDATE → STATIC_VERIFIED（T074 靜態分析通過）
  - [ ] CANDIDATE → NOT_MCP（T074 靜態分析否定）
  - [ ] STATIC_VERIFIED → RUNTIME_VERIFIED（T078 運行時驗證通過）
  - [ ] STATIC_VERIFIED → NOT_MCP（運行時驗證失敗且確認非 server）
  - [ ] RUNTIME_VERIFIED → NOT_MCP（後續發現問題，極少見）
- [ ] `CanTransitionMCPIdentity(from, to MCPIdentityStatus) bool`
- [ ] `MCPIdentity` 結構體（在 Entity 中）：
  ```go
  type MCPIdentity struct {
      Status      MCPIdentityStatus
      Evidence    []Evidence
      Confidence  float64
      Role        MCPRole
      StaticCheckedAt  *time.Time
      RuntimeVerifiedAt *time.Time
  }
  ```
- [ ] Registry View 過濾邏輯（規格書 §44, §54）：
  - [ ] `Verified MCP Servers` = `Classification.Primary == MCP_SERVER` AND `MCPIdentity.Status == RUNTIME_VERIFIED`
  - [ ] `MCP Candidates` = `Classification.Primary == MCP_SERVER` AND `MCPIdentity.Status IN (CANDIDATE, STATIC_VERIFIED)`
- [ ] 單元測試：狀態機轉換、View 過濾邏輯

## 備註

- **關鍵**：規格書 §55 — 永遠不要將 `CANDIDATE` 作為 `VERIFIED SERVER` 展示
- 規格書 §44 定義的三個 view 依賴此狀態
- 狀態與 EntityStatus（DISCOVERED/CANDIDATE/VERIFIED/QUARANTINED/REJECTED）是不同維度

## 執行紀錄

- 待執行