---
github_issue: N/A
title: 加 MCPIdentityStatusVerified 第 5 個 enum（DoD #15）
type: feature
priority: high
status: pending
assignee: pi with opencode
created: 2026-09-07
depends_on: [T097]
updated: 2026-09-07
---

# T102 - 加 MCPIdentityStatusVerified 第 5 個 enum

## 目標

在 `internal/models/entity.go:71-80` 加第 5 個 MCP identity status `MCP_VERIFIED`，並補上 §33 狀態機轉換邏輯。

現況問題：spec §33 規定 5 個狀態（`NOT_MCP` / `MCP_CANDIDATE` / `MCP_STATIC_VERIFIED` / `MCP_RUNTIME_VERIFIED` / `MCP_VERIFIED`），目前只有 4 個，缺 `MCP_VERIFIED`（最終合併態 = 靜態 + 執行 + 基本安全皆通過）。

阻塞：
- spec §64 DoD #15「MCP verification state is explicitly stored」
- spec §44 view「MCP Servers view」需 `mcp.identity.status == MCP_VERIFIED` 才能列為已驗證 MCP server

## 問題根因

`internal/models/entity.go:71-80`：

```go
const (
    MCPIdentityStatusCandidate        MCPIdentityStatus = "CANDIDATE"
    MCPIdentityStatusStaticVerified   MCPIdentityStatus = "STATIC_VERIFIED"
    MCPIdentityStatusRuntimeVerified  MCPIdentityStatus = "RUNTIME_VERIFIED"
    MCPIdentityStatusNotMCP           MCPIdentityStatus = "NOT_MCP"
)

var ValidMCPIdentityStatuses = []MCPIdentityStatus{
    MCPIdentityStatusCandidate,
    MCPIdentityStatusStaticVerified,
    MCPIdentityStatusRuntimeVerified,
    MCPIdentityStatusNotMCP,
}
```

`MCP_VERIFIED`（spec §33 定義：Static + runtime + basic security verification passed）未實作。

## 修法

### A. 加 enum 常數

`internal/models/entity.go:79` 後新增：

```go
// MCPIdentityStatusVerified - Full verification: static + runtime + basic
// security checks all passed (spec §33, §64 DoD #15).
MCPIdentityStatusVerified MCPIdentityStatus = "VERIFIED"
```

並加進 `ValidMCPIdentityStatuses` 切片。

### B. 寫狀態機轉換函數

`internal/models/entity.go` 加 `MCPIdentityStatus` 上的 method（或獨立 helper）：

```go
// ShouldPromoteToVerified reports whether an entity with the given
// static/runtime/security state should be promoted to MCP_VERIFIED.
// spec §33: "Static + runtime + basic security verification passed".
func (s MCPIdentityStatus) ShouldPromoteToVerified(
    staticChecked bool,
    runtimeChecked bool,
    runtimeStatus RuntimeVerificationStatus,
    securityStatus SecurityStatus,
) bool {
    if staticChecked && runtimeChecked &&
        runtimeStatus == RuntimeVerificationStatusPassed &&
        securityStatus != SecurityStatusBlocked {
        return s == MCPIdentityStatusStaticVerified ||
            s == MCPIdentityStatusRuntimeVerified ||
            s == MCPIdentityStatusVerified
    }
    return false
}

// Promote applies a state transition per spec §33. Returns the new state
// or the current state if no transition is valid.
func (s MCPIdentityStatus) Promote(
    staticPassed bool,
    runtimeStatus RuntimeVerificationStatus,
    securityStatus SecurityStatus,
) MCPIdentityStatus {
    switch s {
    case MCPIdentityStatusCandidate:
        if staticPassed {
            return MCPIdentityStatusStaticVerified
        }
    case MCPIdentityStatusStaticVerified:
        if runtimeStatus == RuntimeVerificationStatusPassed {
            // drop down to runtime verified first
            return MCPIdentityStatusRuntimeVerified
        }
    case MCPIdentityStatusRuntimeVerified:
        if staticPassed && runtimeStatus == RuntimeVerificationStatusPassed &&
            securityStatus != SecurityStatusBlocked {
            return MCPIdentityStatusVerified
        }
    }
    return s
}
```

`SecurityStatus` enum 與 `RuntimeVerificationStatus` 應該已存在；找不到的話順手補。

### C. coordinator 主流程串接

`internal/coordinator/coordinator.go` 在 stage 8 (SECURITY_SCANNER) 結束後、stage 9 (QUALITY_SCORING) 前，加 transition pass：

```go
// After security scan, promote MCP identity status if conditions met
// (spec §33, T102).
for _, e := range entities {
    if e.MCPIdentity.Status.ShouldPromoteToVerified(
        e.MCPIdentity.StaticCheckedAt != nil,
        e.RuntimeVerification != nil,
        e.RuntimeVerification.Status,
        e.SecurityStatus.OverallRisk,
    ) {
        e.MCPIdentity.Status = e.MCPIdentity.Status.Promote(
            e.MCPIdentity.StaticCheckedAt != nil,
            e.RuntimeVerification.Status,
            e.SecurityStatus.OverallRisk,
        )
        e.MCPIdentity.RuntimeVerifiedAt = ... // 設為 time.Now() if promoted to RUNTIME_VERIFIED
    }
}
```

### D. View generator filter

`internal/export/view_generator.go` 找「MCP Servers view」生成處（spec §44），把 filter 從 `MCP_RUNTIME_VERIFIED` 改成 `MCP_VERIFIED`（最終合併態）。

## 驗收標準

- [ ] `MCPIdentityStatusVerified` 常數加上
- [ ] `ValidMCPIdentityStatuses` 包含新常數
- [ ] `Promote` 與 `ShouldPromoteToVerified` 函式加上
- [ ] coordinator 在 stage 8 後加 transition pass
- [ ] view generator 的「MCP Servers」filter 對齊 `MCP_VERIFIED`
- [ ] `go build ./...` 通過
- [ ] `go test ./internal/models/... ./internal/coordinator/... ./internal/engines/... -v -count=1` 通過
- [ ] 新增 unit test：
  - Candidate + static pass → StaticVerified
  - StaticVerified + runtime pass → RuntimeVerified
  - RuntimeVerified + static pass + runtime pass + security!=BLOCKED → Verified
  - RuntimeVerified + security BLOCKED → 留在 RuntimeVerified（不升 Verified）
  - 任何 NotMCP 都不會被 promote
- [ ] 既有的 `MCPIdentityStatus` switch case 都加上 `MCPIdentityStatusVerified` 處理（或明確 default 不變）

## 執行紀錄

_(待執行後填寫)_

## 備註

- 依賴 T097（差距分析）
- 對應 spec §33、§44「MCP Servers view」、§64 DoD #15
- 風險：transition 邏輯若放錯 stage 順序（例如 security 之後又跑一次 quality），可能重複 promote。helper 內 `Promote` 是冪等（已 VERIFIED 不再升）可緩解
- `state_machine_test.go` 已有部分測試，新 enum 加進去時要一併擴充
- 相關任務：T097（差距分析）、T100（runtime handshake，才能真正升到 RUNTIME_VERIFIED）
