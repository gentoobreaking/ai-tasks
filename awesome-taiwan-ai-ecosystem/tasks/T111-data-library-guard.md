---
github_issue: N/A
title: Data Library / SDK / Infrastructure 防誤判（spec §22、§23、§48）
type: refactor
priority: medium
status: pending
assignee: pi with opencode
created: 2026-09-07
depends_on: [T097, T108, T109, T110]
updated: 2026-09-07
---

# T111 - Data Library / SDK / Infrastructure 防誤判

## 目標

補強 `Classifier` 對 Data Library（`twmarketdata`）、Data Infrastructure（`tw-quant-db`、PostgreSQL schema）、SDK 套件的防誤判邏輯，落實 spec §22、§23、§48 規定。

現況問題：spec §22 明確說「Data library MUST remain a data library。例如 twmarketdata provides market-data functionality and should not become an MCP server merely because it can be consumed by AI/MCP systems」。spec §23 對 database schema / migration system / ETL / data warehouse 同樣規定。spec §48 拿 `tw-quant-db` 為例。

現有 classifier 的 isMCPServer rule 可能在某些情境下會誤把純 Data SDK 升為 MCP_SERVER（譬如 repo 有 SDK dep + 提供「MCP-style」API）。

阻塞：
- spec §22、§23、§48 規則
- spec §64 DoD #10「Data libraries are separated from servers」
- spec §58 KPI（data SDK 類 entity 是 FP rate 主要來源之一）

## 問題根因

`internal/engines/classifier.go` 的 `isMCPServer` rule 鏈（priority 1）：

```go
// Priority 1: MCP_SERVER - Source code contains MCP server implementation
if c.isMCPServer(entity, &evidence, &reasoning) {
    return c.buildResult(models.PrimaryClassificationMCPServer, evidence, reasoning, models.MCPRoleServer)
}
```

`isMCPServer` 內部可能單獨看到 `@modelcontextprotocol/sdk` dependency 就觸發（spec §29 明確禁止）。Data SDK 套件常會 expose「可用於 MCP client」的工具 API，導致 false positive。

## 修法

### A. 加 isDataLibrary / isDataInfrastructure 規則（Priority -1）

在 `Classify` 開頭加「先排除 data-only 專案」：

```go
func (c *Classifier) Classify(ctx context.Context, entity *models.Entity) models.ClassificationResult {
    // Priority -1: Data library / infrastructure (spec §22, §23, §48)
    // MUST check before MCP server — SDK with MCP-style API but no
    // actual MCP server implementation is a Data Library, not MCP_SERVER.
    if c.isDataLibrary(entity, ...) {
        return DATA_LIBRARY
    }
    if c.isDataInfrastructure(entity, ...) {
        return DATA_INFRASTRUCTURE
    }
    // ... existing priority 1-24 rules
}
```

### B. `isDataLibrary` 規則（spec §22）

```go
func (c *Classifier) isDataLibrary(entity *models.Entity, col *evidence.Collector, reasoning *[]string) bool {
    signals := []string{}

    // Signal 1: Description says "data library / SDK for ..." with no MCP keyword
    desc := strings.ToLower(entity.Description)
    if containsAny(desc, []string{"data library", "data sdk", "market data", "data pipeline"}) &&
       !containsAny(desc, []string{"mcp server", "model context protocol server"}) {
        signals = append(signals, "description: data library without MCP server claim")
    }

    // Signal 2: Package files contain financial data keywords
    for _, file := range entity.Repository.PackageFiles {
        if isFinancialDataFile(file) {
            signals = append(signals, fmt.Sprintf("package: %s", file))
        }
    }

    // Signal 3: Name contains twmarket/twstock/twdata patterns
    name := strings.ToLower(entity.Name)
    if matched, _ := regexp.MatchString(`^(tw|台)[a-z]*?(market|stock|data|finance)`, name); matched {
        signals = append(signals, fmt.Sprintf("name pattern: %s", entity.Name))
    }

    if len(signals) > 0 {
        for _, s := range signals {
            col.AddRuleMatch("isDataLibrary", s, 0.85)
        }
        *reasoning = append(*reasoning, signals...)
        return true
    }
    return false
}
```

### C. `isDataInfrastructure` 規則（spec §23）

```go
func (c *Classifier) isDataInfrastructure(entity *models.Entity, col *evidence.Collector, reasoning *[]string) bool {
    // Look for: database schema, migration, ETL, data warehouse, data pipeline
    // in description, package files, topics
    signals := []string{}

    // Signal 1: Description keywords
    desc := strings.ToLower(entity.Description)
    for _, kw := range []string{"database schema", "migration system", "etl", "data warehouse", "data pipeline", "data layer"} {
        if strings.Contains(desc, kw) {
            signals = append(signals, fmt.Sprintf("description: %s", kw))
        }
    }

    // Signal 2: Repo topics include database / schema
    for _, topic := range entity.Repository.Topics {
        if topic == "database" || topic == "schema" || topic == "etl" {
            signals = append(signals, fmt.Sprintf("topic: %s", topic))
        }
    }

    // Signal 3: Package files suggest schema/migration (e.g. alembic, knex, flyway)
    for _, file := range entity.Repository.PackageFiles {
        if matched, _ := regexp.MatchString(`(migrations?|schema|alembic|knex|flyway|prisma)`, file); matched {
            signals = append(signals, fmt.Sprintf("file: %s", file))
        }
    }

    if len(signals) > 0 {
        for _, s := range signals {
            col.AddRuleMatch("isDataInfrastructure", s, 0.85)
        }
        *reasoning = append(*reasoning, signals...)
        return true
    }
    return false
}
```

### D. 套用硬規則（spec §29 + spec §22）

在 `isMCPServer` 內，加 guard：

```go
func (c *Classifier) isMCPServer(entity *models.Entity, ...) bool {
    // Hard rule (spec §22, §23, §29): if entity is a Data Library or
    // Data Infrastructure, don't classify as MCP_SERVER just because
    // it has SDK dep or MCP keyword.
    if c.isDataLibrary(entity, ...) || c.isDataInfrastructure(entity, ...) {
        return false
    }
    // ... existing rules
}
```

### E. unit test

```go
func TestClassifier_TwMarketData_NotMCPServer(t *testing.T) {
    entity := &models.Entity{
        Name: "twmarketdata",
        Description: "Taiwan stock market data Python SDK",
        Repository: models.RepositoryInfo{
            Topics: []string{"taiwan", "stock", "data"},
        },
    }
    result := classifier.Classify(ctx, entity)
    assert.Equal(t, "DATA_LIBRARY", string(result.Primary))
    assert.NotEqual(t, "MCP_SERVER", string(result.Primary))
}

func TestClassifier_TwQuantDB_NotMCPServer(t *testing.T) {
    entity := &models.Entity{
        Name: "tw-quant-db",
        Description: "Shared PostgreSQL schema/data layer for Taiwan quant trading",
        Repository: models.RepositoryInfo{
            Topics: []string{"database", "postgresql", "taiwan"},
        },
    }
    result := classifier.Classify(ctx, entity)
    assert.Equal(t, "DATA_INFRASTRUCTURE", string(result.Primary))
}
```

## 驗收標準

- [ ] `Classifier.isDataLibrary` 函式實作
- [ ] `Classifier.isDataInfrastructure` 函式實作
- [ ] `Classifier.Classify` 開頭先檢查 data library/infrastructure
- [ ] `isMCPServer` 加 guard 避免誤判
- [ ] `go build ./...` 通過
- [ ] `go test ./internal/engines/... -v -count=1` 通過
- [ ] 新增 unit test（至少 4 個）：
  - `twmarketdata` → DATA_LIBRARY
  - `tw-quant-db` → DATA_INFRASTRUCTURE
  - `fugle-agent` (spec §49) → AI_AGENT（不過度升 MCP_SERVER）
  - `awesome-taiwan-mcp` (spec §47) → MCP_COLLECTION
- [ ] T107 FP rate 重跑，預期 Data SDK 類 FP 從 ~30% 降到 < 5%
- [ ] acceptance_test.go §56 Test 10 通過（spec §56 Test 10：Taiwan financial data Python SDK → DATA_LIBRARY）

## 執行紀錄

_(待執行後填寫)_

## 備註

- 依賴 T097、T108、T109、T110
- 對應 spec §22、§23、§48、§56 Test 10、§64 DoD #10
- 風險：description-based 判斷在非英語 entity（中文描述）會失效。可考慮翻譯預處理或加中文信號字典
- 預期效益：Data SDK / Infrastructure 類 entity 在 561 legacy dataset 約 30-40 筆，目前若誤判為 MCP_SERVER 貢獻約 5-8% FP rate；修好後預期 < 1%
- 與 T110 互補：T110 處理 keyword-only 誤判，T111 處理 description-based 誤判
- 相關任務：T097、T108、T109、T110
