---
github_issue: N/A
title: 用 migrator reclassify 561 legacy records 驗證 FP rate < 5%（§58 KPI）
type: validation
priority: high
status: pending
assignee: pi with opencode
created: 2026-09-07
depends_on: [T097, T098, T099, T100, T101, T102]
updated: 2026-09-07
---

# T107 - Migrator reclassify 561 legacy records 驗證 FP rate < 5%

## 目標

執行 `cmd/migrate` 把 561 筆 legacy `mcp_servers` 重新分類成 v2 `entities`，驗證 MCP server 識別的 false positive rate 是否 < 5%（spec §58 KPI）。

現況問題：
- spec §59 指出 baseline 為「561 Servers / 200 Taiwan Relevant / 361 T0 / 503 Quality F」— 太多低品質誤判
- spec §58 要求 MCP false positive rate < 5%（長期 < 2%）
- 沒有任何「實際跑 migrate 並量 FP rate」的工作

阻塞：
- spec §64 DoD #19「Existing records can be migrated」+ #20「False-positive acceptance tests pass」+ #21「MCP false-positive rate is below 5%」

## 問題根因

`cmd/migrate/main.go` 已有 V1→V2 遷移 CLI（`migrate/main.go:100-202`），但從未在生產 dataset 跑過，FP rate 未知。

`internal/engines/acceptance_test.go` 14 個 acceptance test 已實作（spec §56 Test 1–12），但**沒有跑 migrate 實際 dataset 的整合測試**。

`internal/engines/fp_rate_test.go` 有 FP rate 計算，但只對 fixture 樣本測試。

## 修法

### A. 跑 migrate

```bash
# 1. 確保 DB 有 v1 legacy data
docker compose up -d api  # api 啟動時會跑 migration 建 v1 schema
docker compose exec api sqlite3 /data/db/registry.db ".tables"
# 預期看到 mcp_servers, repositories, endpoints, tools, ...

# 2. 執行 migrate（從 v1 讀、寫到 v2 entities）
docker compose exec crawler /usr/local/bin/migrator \
    --input /data/db/registry.db \
    --output /data/db/registry.db \
    --reclassify
# 預期 log 顯示 "Processed 561 records, X errors"
```

### B. 寫 FP rate 量測 script

新增 `scripts/measure_fp_rate.py`（Python script，**不**在 Go 內以避免 build 複雜度）：

```python
# 讀取 migrate 產出的 entities.json，比對 legacy 標籤
# 計算：
#   - True Positive (TP): legacy 標 MCP_SERVER，新架構也標 MCP_SERVER + MCP_VERIFIED
#   - False Positive (FP): legacy 標 MCP_SERVER，新架構標非 MCP_SERVER 或 NOT_MCP
#   - False Negative (FN): legacy 標非 MCP_SERVER，新架構升為 MCP_SERVER
#   - Precision = TP / (TP + FP)
#   - Recall = TP / (TP + FN)
#   - FP Rate = FP / (TP + FP)  ← spec §58 KPI
```

### C. Acceptance test 整合

擴充 `internal/engines/acceptance_test.go`，加 integration test case：

```go
// TestAcceptance_FPRateOnMigratedDataset runs migrate on a fixture of
// 561 v1 records and asserts the FP rate is below 5% (spec §58).
func TestAcceptance_FPRateOnMigratedDataset(t *testing.T) {
    if testing.Short() { t.Skip("integration test") }
    store := setupLegacyFixture(t)  // 從 internal/testdata 載入 fixture
    defer store.Close()

    migrator := migrate.NewMigrator(store, nil)
    entities, err := migrator.Run(ctx)
    require.NoError(t, err)

    classifier := engines.NewClassifier()
    fp, tp, fn := 0, 0, 0
    for _, e := range entities {
        actual := classifier.Classify(e)
        if e.LegacyLabels.MCPServer && actual.Primary != "MCP_SERVER" {
            fp++
        }
        if e.LegacyLabels.MCPServer && actual.Primary == "MCP_SERVER" {
            tp++
        }
        if !e.LegacyLabels.MCPServer && actual.Primary == "MCP_SERVER" {
            fn++
        }
    }
    fpRate := float64(fp) / float64(fp+tp)
    assert.Less(t, fpRate, 0.05, "spec §58 KPI: FP rate must be below 5%%")
}
```

`internal/testdata/legacy_561.json` fixture 若不存在，從 production DB dump 出來。

### D. 報表

`scripts/fp_report.md` 自動產生，列出：
- TP / FP / FN 數量
- Precision / Recall / FP Rate
- 前 20 大 FP 案例（legacy 標 MCP_SERVER，新架構判 NOT_MCP 的）
- 通過/未通過 KPI

## 驗收標準

- [ ] migrate 跑完 561 筆無 error
- [ ] migrate 產出的 `entities.json` 通過 `schema/registry.json` v2.0 驗證
- [ ] `scripts/measure_fp_rate.py` 產出 FP rate 報表
- [ ] `TestAcceptance_FPRateOnMigratedDataset` integration test 通過（FP rate < 5%）
- [ ] 報表列出 FP 案例分類（tutorial / collection / data library / skill / client-only 等）
- [ ] 若 FP rate ≥ 5%，需：
  - 在 `audit-markdown.md` 記錄現況
  - 開 follow-up T108+ 改善 classifier
  - 不能假裝通過

## 執行紀錄

_(待執行後填寫)_

## 備註

- 依賴 T097、T098（DB 寫入）、T099（export）、T100（runtime handshake）、T101（discovery 兩階段）、T102（MCP_VERIFIED state）
- 對應 spec §56（12 acceptance tests）、§58（FP rate KPI）、§59（baseline 561）、§64 DoD #19/20/21
- **風險**：現有 classifier 是 keyword-based，預期 FP rate 在 10-20%，**很可能達不到 < 5% 目標**。本任務的價值在於誠實量測並揭露缺口，而非假裝通過
- 若達不到 5%，需 follow-up：spec §4.4 evidence-based classification + §27 evidence weighting 必須落實，可能要加 LLM classifier fallback（T073）
- 561 筆 dataset 包含大量「awesome-」 collection、Taiwan 開源社群、MOPS / TWSE 工具 — 這些多數不是 MCP server，FP rate 會高
- 相關任務：T097、T098、T099、T100、T101、T102、T073（LLM classifier fallback，預計）
