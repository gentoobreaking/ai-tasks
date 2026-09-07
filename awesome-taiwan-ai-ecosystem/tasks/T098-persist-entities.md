---
github_issue: N/A
title: Coordinator 主流程持久化 Entity 到 DB（P0-1 阻塞項）
type: bugfix
priority: high
status: pending
assignee: pi with opencode
created: 2026-09-07
depends_on: [T097]
updated: 2026-09-07
---

# T098 - Coordinator 主流程持久化 Entity 到 DB

## 目標

修補 `internal/coordinator/coordinator.go` `Run()` 主流程**未把 entity 寫進 DB** 的問題。

目前 `entityStore.Save` 只在 `runRuntimeVerificationOnly` 內被呼叫（`coordinator.go:474`），只有 `--pipeline verify-only` 才會跑到；其他三種 mode（`full` / `discovery-only` / `classify-only`）跑完整個 pipeline 後 DB 仍是空的（`db_count: 0`）。

此問題阻塞：
- spec §60 預期的 list（`taiwan-ai-ecosystem.md` 等 view 檔）
- spec §64 DoD「MCP Server registry is generated as a filtered view of the Taiwan AI Ecosystem registry」
- 任何後續 `bin/export` 或 `bin/api` 對 entity 的查詢

## 問題根因

`internal/coordinator/coordinator.go:128-198` `Run()`：

```go
// Stage 2: NORMALIZER + Dedup → convert to Entity for downstream stages
entities, err := pc.runNormalize(ctx, crawlID, rawRecords)
...
// Stage 3~9: 一連串 in-memory 操作，無 Save
pc.runTaiwanRelevance(...)
pc.runAIRelevance(...)
pc.runClassifier(...)
pc.runMCPIdentity(...)
pc.runRuntimeVerification(...)
pc.runSecurityScan(...)
pc.runQualityScoring(...)
// Stage 10: REGISTRY VIEWS — 從記憶體 entities 寫 views
pc.runRegistryViews(...)
```

`runRegistryViews` 從**記憶體**的 `entities` slice 直接呼叫 view generator（`internal/export/view_generator.go`），**完全沒經過 DB**。所以 view 寫出後 DB 仍是空，後續重啟 crawler 也讀不到。

## 修法

在 stage 9（QUALITY_SCORING）結束後、stage 10（REGISTRY_VIEWS）前，**一次性批次** `entityStore.Save(ctx, e)` 全部 entities。

**為何選這位置**：
- Quality scoring 是最後一個會修改 entity 欄位的 stage，存這裡能一次寫入「Taiwan/AI/Classification/MCP Identity/Runtime Verification/Security/Quality」全部結果
- 在 stage 10 前存：確保 export 與 view generator 一致（都從 DB 讀或都從 memory 讀，二擇一）
- 一次批次：避免每個 stage 都寫 N 次 DB（效能）

**修改位置**：`internal/coordinator/coordinator.go:186-194`

**修改前**：
```go
// Stage 9: QUALITY SCORING
pc.runQualityScoring(ctx, crawlID, entities)
results = append(results, StageResult{Stage: "QUALITY_SCORING", ItemCount: len(entities)})

// Stage 10: REGISTRY VIEWS
if cfg.Mode == ModeFull {
    pc.runRegistryViews(ctx, crawlID, entities, cfg.OutputDir)
}
results = append(results, StageResult{Stage: "REGISTRY_VIEWS", ItemCount: len(entities)})
```

**修改後**：
```go
// Stage 9: QUALITY SCORING
pc.runQualityScoring(ctx, crawlID, entities)
results = append(results, StageResult{Stage: "QUALITY_SCORING", ItemCount: len(entities)})

// Stage 9.5: PERSIST — write all entities to DB (idempotent upsert)
if pc.entityStore != nil {
    if err := pc.persistEntities(ctx, entities); err != nil {
        return fmt.Errorf("persist stage: %w", err)
    }
    results = append(results, StageResult{Stage: "PERSIST", ItemCount: len(entities)})
}

// Stage 10: REGISTRY VIEWS
if cfg.Mode == ModeFull {
    pc.runRegistryViews(ctx, crawlID, entities, cfg.OutputDir)
}
results = append(results, StageResult{Stage: "REGISTRY_VIEWS", ItemCount: len(entities)})
```

新增 helper `persistEntities`（同檔內）：

```go
// persistEntities writes all entities to the entity store (idempotent upsert).
// Failures are logged but do not abort the pipeline so that one bad entity
// doesn't lose the entire batch — caller decides whether to escalate.
func (pc *PipelineCoordinator) persistEntities(ctx context.Context, entities []*models.Entity) error {
    var saved, failed int
    for _, e := range entities {
        if err := pc.entityStore.Save(ctx, e); err != nil {
            pc.logger.Warn(ctx, "", "PERSIST", "save_failed",
                "entity_id", e.ID, "name", e.Name, "error", err.Error())
            failed++
            continue
        }
        saved++
    }
    pc.logger.Info(ctx, "", "PERSIST", "save_complete",
        "saved", saved, "failed", failed, "total", len(entities))
    return nil
}
```

**注意**：
- 失敗不中斷 pipeline（與 `runRuntimeVerificationOnly` 內 `_ = pc.entityStore.Save` 行為一致）— 一筆壞資料不應丟整批
- 但 caller（`Run`）仍把 `error` 接住往上拋，所以若整個 DB 故障（譬如磁碟滿）仍會 fail-fast
- `pc.entityStore` 已在 `New()` 內 lazy-init（`coordinator.go:121-123`），不會 nil

## 驗收標準

- [ ] `internal/coordinator/coordinator.go` 修改完成
- [ ] `persistEntities` helper 加上
- [ ] `go build ./...` 通過
- [ ] `go test ./internal/coordinator/... -v -count=1` 通過
- [ ] 啟動 `ai-ecosystem-crawler` 跑完一次後，`data/registry.db` 的 `entities` table 至少有一筆 row
- [ ] 啟動 `ai-ecosystem-crawler` 後呼叫 `curl http://localhost:8003/api/v1/servers` 不再回空（或對 `entities` table `SELECT COUNT(*)` 不為 0）
- [ ] 重跑一次 crawler，DB 中 entity 數量不重複累加（idempotent upsert）
- [ ] 在 DB 寫死 read-only 情境下，crawler 不 panic，log 出 `save_failed` 但 pipeline 繼續到 stage 10

## 執行紀錄

_(待執行後填寫)_

## 備註

- 依賴 T097（差距分析）完成
- 對應 spec §43 pipeline 缺 entity 持久化的根本問題
- 完成本任務後，`db_count` 從 0 變 > 0；後續 T099（P0-2: export 改讀 EntityStore）與 T100（P3-1: views 寫到 `registry/` 根目錄）就能讓 §60 list 真正出現
- 風險：若 entity 數量很大（10k+），`persistEntities` 採序列寫入會慢；後續可考慮 batch INSERT 或 transaction，目前先保持簡單
- 相關任務：T097（差距分析）、T099（export 改讀 EntityStore，預計）、T100（views 寫出路徑，預計）
