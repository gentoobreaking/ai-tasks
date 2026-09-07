---
github_issue: N/A
title: Entity schema 補 SourceReference.Primary 與 MCPIdentity.Related（§37 對齊）
type: refactor
priority: medium
status: pending
assignee: pi with opencode
created: 2026-09-07
depends_on: [T097]
updated: 2026-09-07
---

# T104 - Entity schema 補 SourceReference.Primary 與 MCPIdentity.Related

## 目標

補 `internal/models/entity.go` 兩個欄位以對齊 spec §37 entity schema。

現況缺口：
- `SourceReference` 缺 `Primary` 布林（spec §37 要求 `source.primary`）
- `MCPIdentity` 缺顯式 `Related` 布林（spec §37 要求 `mcp.related`，目前隱含在 `MCPIdentity` struct 內）

阻塞：
- spec §64 DoD「Discovery no longer depends on MCP keywords」（隱性 — 若 `mcp.related` 無法獨立表示，難以拒絕誤判）
- spec §37 schema 對齊（API 對外契約缺欄位）

## 問題根因

`internal/models/entity.go:497-504` `SourceReference`：

```go
type SourceReference struct {
    Source       string      `json:"source"`
    URL          string      `json:"url"`
    DiscoveredAt RFC3339Time `json:"discovered_at"`
    LastSeen     RFC3339Time `json:"last_seen"`
    TrustScore   float64     `json:"trust_score"`
}
```

缺 `Primary bool`（spec §37 的 `source.primary`）。

`internal/models/entity.go:336-345` `MCPIdentity`：

```go
type MCPIdentity struct {
    Status              MCPIdentityStatus      `json:"status"`
    Evidence            []Evidence             `json:"evidence"`
    Confidence          float64                `json:"confidence"`
    Role                MCPRole                `json:"role"`
    SecondaryRoles      []MCPRole              `json:"secondary_roles,omitempty"`
    StaticCheckedAt     *RFC3339Time           `json:"static_checked_at,omitempty"`
    RuntimeVerifiedAt   *RFC3339Time           `json:"runtime_verified_at,omitempty"`
}
```

`MCPIdentity` struct 本身就隱含「related to MCP」，但 spec §37 要求顯式 `mcp.related` 布林 — 譬如 `MCP_COLLECTION`（awesome-taiwan-mcp）`mcp.related = true` 但 `mcp.identity.status = NOT_MCP`。

## 修法

### A. `SourceReference.Primary`

```go
// SourceReference holds discovery source info (spec §16, §37, §64).
type SourceReference struct {
    Primary      bool        `json:"primary"`        // NEW: spec §37 source.primary
    Source       string      `json:"source"`
    URL          string      `json:"url"`
    DiscoveredAt RFC3339Time `json:"discovered_at"`
    LastSeen     RFC3339Time `json:"last_seen"`
    TrustScore   float64     `json:"trust_score"`
}
```

加 helper method：

```go
// IsMCPRelated reports whether the entity has any MCP-related signal,
// independent of its MCP identity status (spec §37 mcp.related).
func (e *Entity) IsMCPRelated() bool {
    return e.MCPIdentity.Related
}
```

### B. `MCPIdentity.Related`

```go
type MCPIdentity struct {
    Related            bool                   `json:"related"`              // NEW: spec §37 mcp.related
    Status             MCPIdentityStatus      `json:"status"`
    Evidence           []Evidence             `json:"evidence"`
    Confidence         float64                `json:"confidence"`
    Role               MCPRole                `json:"role"`
    SecondaryRoles     []MCPRole              `json:"secondary_roles,omitempty"`
    StaticCheckedAt    *RFC3339Time           `json:"static_checked_at,omitempty"`
    RuntimeVerifiedAt  *RFC3339Time           `json:"runtime_verified_at,omitempty"`
}
```

### C. coordinator 設定規則

`internal/coordinator/coordinator.go:430` 附近的 `runMCPIdentity` 後加：

```go
// Set MCPIdentity.Related = true if any MCP signal is found in evidence
// (spec §37 mcp.related). Independent of Status — even NOT_MCP can be related.
for _, e := range entities {
    e.MCPIdentity.Related = len(e.MCPIdentity.Evidence) > 0
}
```

### D. `SourceReference.Primary` 設定

第一次寫入 Sources 時（coordinator normalize stage 結束前）把第一個 source 標 `Primary = true`，其餘 `false`：

```go
// 在 runNormalize 結尾：
for _, e := range entities {
    if len(e.Sources) > 0 {
        for i := range e.Sources {
            e.Sources[i].Primary = i == 0
        }
    }
}
```

## 驗收標準

- [ ] `SourceReference.Primary bool` 欄位加，JSON tag `primary`
- [ ] `MCPIdentity.Related bool` 欄位加，JSON tag `related`
- [ ] `IsMCPRelated()` helper method 加
- [ ] coordinator `runMCPIdentity` 後設 `MCPIdentity.Related` 規則
- [ ] coordinator `runNormalize` 結尾設 `SourceReference.Primary`
- [ ] `go build ./...` 通過
- [ ] `go test ./internal/... -v -count=1` 通過
- [ ] 新增 unit test：
  - Entity 跑完整 pipeline 後，`Sources[0].Primary == true`、`Sources[1].Primary == false`
  - Entity 跑完 MCP identity engine 後，`MCPIdentity.Related == true`（若有 evidence）
  - Entity 即使 `MCPIdentity.Status == NOT_MCP` 但有 evidence，`MCPIdentity.Related == true`
- [ ] 既有的 `view_generator_test.go`、`api_test.go` 等引用 `SourceReference` / `MCPIdentity` 的測試不 break

## 執行紀錄

_(待執行後填寫)_

## 備註

- 依賴 T097（差距分析）
- 對應 spec §37 entity schema、`mcp.related` 與 `source.primary` 欄位
- 風險：DB schema v2 若有既有的 `SourceReference` JSON 欄位，加欄位是向下相容（既有 row 沒有 `primary` 欄位時，反序列化得 `false`）。`Related` 同理。但 view generator 與 API response 會多出新欄位，要通知 web 前端
- DB migration：`_crawler_migrations` 表加 `004_entity_schema_align`，但因為是 JSON 內欄位而非 SQL column，不需要實際 migration — 寫個 no-op migration 留 audit 紀錄即可
- 相關任務：T097（差距分析）、T106（schema/registry.json 升 v2.0，預計）
