---
github_issue: N/A
title: cmd/crawler runExport 改讀 EntityStore（P0-2 阻塞項）
type: bugfix
priority: high
status: pending
assignee: pi with opencode
created: 2026-09-07
depends_on: [T097, T098]
updated: 2026-09-07
---

# T099 - cmd/crawler runExport 改讀 EntityStore

## 目標

修補 `cmd/crawler/main.go` `runExport` 從 legacy `Store.GetServers()` 讀 MCPServer 的問題，改成從 `EntityStore.List()` 讀 Entity，產出符合 spec §60 的 view 檔。

目前 `runExport` 仍透過 `store.GetServers()`（= legacy MCPServer）取資料，再呼叫 `serverToEntity()` 強轉型，但 `EntityStore` 才是 spec §43 pipeline 真正的目的地——前者已被淘汰，後者才有 Taiwan/AI/MCP identity/Runtime verification/Security/Quality 等完整欄位。

此問題阻塞：
- spec §60 list（`taiwan-ai-ecosystem.md` 等）
- spec §64 DoD「MCP Server registry is generated as a filtered view of the Taiwan AI Ecosystem registry」
- 任何後續 export pipeline（`bin/crawler export` 應與 `bin/export` 一致）

## 問題根因

`cmd/crawler/main.go:444-488` `runExport`：

```go
func runExport(cmd *cobra.Command, _ []string) error {
    store, err := openStore()
    ...
    servers, err := store.GetServers(context.Background())  // ← legacy MCPServer
    ...
    entities := make([]*models.Entity, 0, len(servers))
    for i := range servers {
        entities = append(entities, serverToEntity(&servers[i]))  // ← 強轉型，欄位空
    }
    ...
    if markdownExport {
        // TODO: generate REGISTRY.md using ViewGenerator  ← 從未實作
        fmt.Println("Registry markdown export: placeholder")
    }
    fmt.Println("Export complete: " + expDir)
    return nil
}
```

**對照 `cmd/export/main.go:39-86` `runExport`（正確版本）**：

```go
entityStore := storage.NewEntityStore(db.DB())
entities, err := entityStore.List(ctx, storage.EntityFilter{})  // ← 直接讀 v2 entity
...
vg := export.NewViewGenerator(export.ViewConfig{...})
viewsDir := filepath.Join(outputDir, "views")
...
if err := vg.GenerateViews(entities, viewsDir); err != nil { ... }  // ← 真正產 view
```

兩者功能重疊、實作分叉。T099 要把 `cmd/crawler runExport` 對齊 `cmd/export` 的正確實作。

## 修法

**方案 A（推薦）：直接複製 `cmd/export` 的實作到 `cmd/crawler runExport`，刪除重複程式**

理由：
- 兩個 binary 同一團隊維護，邏輯應該只有一份
- `cmd/export` 已驗證可用
- 修改範圍小（~30 行），不引入新概念

**修改位置**：`cmd/crawler/main.go:444-488`

**修改後**（與 `cmd/export/main.go:runExport` 對齊）：

```go
func runExport(cmd *cobra.Command, _ []string) error {
    store, err := openStore()
    if err != nil {
        return err
    }
    defer store.Close()

    ctx := context.Background()
    entityStore := storage.NewEntityStore(store.DB())
    entities, err := entityStore.List(ctx, storage.EntityFilter{})
    if err != nil {
        return fmt.Errorf("list entities: %w", err)
    }

    vg := export.NewViewGenerator(export.ViewConfig{
        SchemaVersion:  "2.0",
        CrawlerVersion: "dev",
    })

    // 寫到 registry/ 根目錄（spec §60），不寫到 registry/views/
    expDir := "registry"
    if err := os.MkdirAll(expDir, 0755); err != nil {
        return fmt.Errorf("create export dir: %w", err)
    }
    if err := vg.GenerateViews(entities, expDir); err != nil {
        return fmt.Errorf("generate views: %w", err)
    }

    // 惡意報告（保留既有功能）
    if maliciousReport {
        if err := generateMaliciousReport(entities, maliciousDir, maliciousThreshold); err != nil {
            fmt.Fprintf(os.Stderr, "Warning: malicious report generation failed: %v\n", err)
        }
    }
    if injectionReport {
        if err := generateInjectionReport(entities, injectionDir); err != nil {
            fmt.Fprintf(os.Stderr, "Warning: injection report generation failed: %v\n", err)
        }
    }

    fmt.Printf("Exported %d entities to %s/\n", len(entities), expDir)
    entries, _ := os.ReadDir(expDir)
    for _, entry := range entries {
        if !entry.IsDir() {
            fmt.Printf("  - %s\n", entry.Name())
        }
    }
    return nil
}
```

**同步刪除**：
- `serverToEntity` helper（`cmd/crawler/main.go:491-509`）—不再需要
- `markdownExport` flag 與 placeholder（`main.go:480-484`）—已被 ViewGenerator 取代

**注意**：
- 路徑從 `registry/views/` 改為 `registry/` 根目錄（spec §60 結構）。**這項屬於 T100 的範疇，但因為改動點跟 export 同步，這裡順手做**。
- 若想分兩次 commit，可改為 `expDir := filepath.Join("registry", "views")` 留給 T100 改路徑。

**方案 B（保留兩個 binary 的差別）**：
- `cmd/crawler export`：保留既有 malicious/injection report 邏輯，**加上** view generation
- `cmd/export`：維持現狀（純 view generation）

兩者最終呼叫 `vg.GenerateViews(entities, dir)` 同一行。差異只剩「是否同時產 malicious/injection 報告」。T099 採方案 A 即可。

## 驗收標準

- [ ] `cmd/crawler/main.go:444-488` 改為讀 `EntityStore.List`
- [ ] `serverToEntity` 函式刪除
- [ ] `markdownExport` flag 與 placeholder 刪除
- [ ] `go build ./...` 通過
- [ ] `go test ./cmd/... ./internal/export/... -v -count=1` 通過
- [ ] 跑 `crawler export`（DB 有 entity 前提下）會在 `registry/` 產出至少：
  - `taiwan-ai-ecosystem.md`
  - `taiwan-mcp.md`
  - `taiwan-ai-agents.md`
  - `taiwan-ai-tools.md`
  - `taiwan-ai-data.md`
- [ ] `bin/crawler export` 與 `bin/export` 產出檔案一致
- [ ] malicious / injection report 仍正常產出
- [ ] `--help` 中 `markdownExport` flag 移除

## 執行紀錄

_(待執行後填寫)_

## 備註

- 依賴 T097（差距分析）與 T098（coordinator 存 entity）完成 — T098 沒做，DB 空，T099 即使修了 export 邏輯也沒資料
- 對應 spec §60 list 與 §64 DoD「MCP Server registry is generated as a filtered view of the Taiwan AI Ecosystem registry」
- 完成 T098 + T099 + T100 = crawler 跑出 §60 list 的最短路徑
- 風險：兩條 export 實作合併後若有人依賴 `bin/crawler export` 的舊行為（產 `malicious_report.md` 但不產 view），需在 CHANGELOG 註明
- 相關任務：T097（差距分析）、T098（persist entities）、T100（views 寫到 `registry/` 根目錄，預計被本任務一併處理）
