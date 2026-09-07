---
github_issue: N/A
title: MCP Identity 實作 spec §27 evidence weighting
type: refactor
priority: medium
status: pending
assignee: pi with opencode
created: 2026-09-07
depends_on: [T097, T108, T109]
updated: 2026-09-07
---

# T110 - MCP Identity 實作 spec §27 evidence weighting

## 目標

把 `internal/engines/mcp_identity.go` 的 confidence 計算從「命中數量」改為「spec §27 規定的 10 個 evidence 加權」，並應用 spec §28–§30 hard rules。

現況問題：T097 看過 `mcp_identity.go:782`（共 882 行）已有 scoring 邏輯，但**「scoring system MUST NOT simply sum blindly」+ 「classifier MUST apply hard rules」**。需 review 是否對齊 spec §27 權重表。

阻塞：
- spec §27 evidence weighting（10 種 evidence + 對應 weight）
- spec §28–§30 hard rules（MCP keyword 不夠、SDK dep 不夠、Registry listing 不夠）
- spec §58 KPI 達成路徑

## 問題根因

`internal/engines/mcp_identity.go` 的 scoring 細節需在 T110 開工時讀完整檔案，但根據 T097 報告：

- §27 weight 表共 10 個 entry（MCP keyword +5, MCP topic +5, MCP SDK dep +10, MCP server classes +25, MCP tool defs +15, executable entrypoint +15, valid server config +10, runtime handshake +20, tools/list success +10, resources/list success +5, prompts/list success +5）
- §28 hard rule：「README 含 MCP 字串」單獨不能升 MCP_SERVER
- §29 hard rule：「@modelcontextprotocol/sdk dependency」單獨不能升 MCP_SERVER
- §30 hard rule：Glama/PulseMCP 列出但 `runtime_verified: false` → 留 `UNVERIFIED`

預期現有 scoring 沒嚴格套用 hard rules（可能 SDK dep + keyword 就升 MCP_SERVER）。

## 修法

### A. 套用 §27 weight 表

`internal/engines/mcp_identity.go`：

```go
// mcpIdentityEvidenceWeights per spec §27.
// total max = 5+5+10+25+15+15+10+20+10+5+5 = 125 (capped at 100)
var mcpIdentityEvidenceWeights = map[string]float64{
    "mcp_keyword":             5,
    "mcp_topic":               5,
    "mcp_sdk_dependency":      10,
    "mcp_server_classes":      25,
    "mcp_tool_definitions":    15,
    "executable_entrypoint":   15,
    "valid_server_config":     10,
    "runtime_handshake":       20,
    "tools_list_success":      10,
    "resources_list_success":  5,
    "prompts_list_success":    5,
}

func computeMCPIdentityConfidence(evidences []models.Evidence) float64 {
    sum := 0.0
    for _, e := range evidences {
        w, ok := mcpIdentityEvidenceWeights[e.Rule]
        if !ok { continue }
        sum += w * e.Confidence
    }
    // Cap at 100
    if sum > 100 { sum = 100 }
    return sum
}
```

### B. 套用 §28 hard rule（MCP keyword alone ≠ MCP_SERVER）

```go
// applyHardRuleKeywordOnly: if the only evidence is keyword-based,
// identity remains UNVERIFIED (spec §28).
func applyHardRuleKeywordOnly(evidences []models.Evidence) bool {
    hasStrongEvidence := false
    for _, e := range evidences {
        switch e.Rule {
        case "mcp_keyword", "mcp_topic":
            continue
        default:
            hasStrongEvidence = true
        }
    }
    return hasStrongEvidence
}
```

### C. 套用 §29 hard rule（SDK dep alone ≠ MCP_SERVER）

類似 — 必須有 `mcp_server_classes` 或 `executable_entrypoint` 或 `runtime_handshake` 之一才能升 MCP_SERVER。

### D. 套用 §30 hard rule（registry listing 不足）

`SourceRegistryListed bool` 在 entity 上，若 true 但 runtime 沒過，identity 留 `UNVERIFIED` 不升 `MCP_RUNTIME_VERIFIED`。

### E. 整合到現有 scoring

`mcp_identity.go:782` 附近的 scoring 函式改用 `computeMCPIdentityConfidence` + 三條 hard rule，最終 confidence 是加權分；status 升級條件需通過所有 hard rule。

## 驗收標準

- [ ] `mcpIdentityEvidenceWeights` 表加上（11 個 entry）
- [ ] `computeMCPIdentityConfidence` 函式實作
- [ ] `applyHardRuleKeywordOnly` 函式實作
- [ ] `applyHardRuleSDKDepOnly` 函式實作
- [ ] `applyHardRuleRegistryOnly` 函式實作
- [ ] 現有 `mcp_identity.go` scoring 改用新函式
- [ ] `go build ./...` 通過
- [ ] `go test ./internal/engines/mcp_identity_test.go ./internal/engines/acceptance_test.go -v -count=1` 通過
- [ ] 新增 unit test（spec §56 Test 1-3 對齊）：
  - **Test 1**（§56）：只 README 含 "MCP"，無其他 evidence → `status != MCP_SERVER`（hard rule 觸發）
  - **Test 2**（§56）：有 `@modelcontextprotocol/sdk` 但實作 client only → `status = MCP_CLIENT`（hard rule 觸發，SDK 不夠）
  - **Test 3**（§56）：有 `McpServer` + `StdioServerTransport` + tool defs + entrypoint → `status = MCP_SERVER` confidence ≥ 80
  - **Test 4**（§56）：runtime handshake success → `status = MCP_RUNTIME_VERIFIED` confidence +20
- [ ] T107 FP rate 重跑，預期下降 3-5 個百分點

## 執行紀錄

_(待執行後填寫)_

## 備註

- 依賴 T097、T108、T109
- 對應 spec §27、§28、§29、§30、§56 Test 1-4
- 風險：T109 擴充 evidence 結構後，現有 `mcp_identity_test.go` 87 行可能 break，要 review
- 預期效益：套用 hard rule 後，純 keyword-based FP 會被濾掉，預期 FP rate 從 ~15% 降到 ~10%
- 與 T111（Data Library 防誤判）互補：T110 處理「keyword-only 誤判」，T111 處理「Data SDK 誤判為 MCP_SERVER」
- 相關任務：T097、T108、T109、T111
