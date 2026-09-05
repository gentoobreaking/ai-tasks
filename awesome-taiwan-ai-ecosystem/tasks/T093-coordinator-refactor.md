---
github_issue: N/A
title: Crawler Coordinator 重構 - 適配新 Entity 模型與協調器邏輯修復
type: refactor
priority: high
status: pending
depends_on: ["T072", "T074", "T078"]
assignee: pi
created: 2026-09-05
updated: 2026-09-05
---

# T093 - Crawler Coordinator 重構 - 適配新 Entity 模型與協調器邏輯修復

## 目標

重構 `internal/crawler/coordinator.go` 以完全適配新的 Entity 模型架構，修復協調器中所有編譯錯誤，確保爬蟲管線各階段正確運作。

主要問題：
1. `Run` 函數結構不完整，導致驗證/持久化階段代碼在包級別而非函數內部
2. `security.New()` 應改為 `security.NewScanner()`
3. `c.secScanner.ScanServer()` 需改為 `c.secScanner.Scan()`
4. `sources.RawRecord` 未定義，需改為 `models.RawRecord`
4. `models.SourceTrustScores` 非 map，需用 `getSourceTrustScore()` 輔助函數
5. `models.TaiwanRelevanceLevel` 需正確類型轉換
5. `server.TopicList` 應改為 `server.Category`
6. `server.GetReadme()` 應改為 `server.Readme`
7. `models.RFC3339Time` 缺少 `After` 方法
8. `models.StatusDeleted` 等狀態常量缺失
9. `models.DataSourceScores` 非 map，需 switch 實現
10. `models.SecurityStatusDetail` 非 slice，需用 `.Findings` 迭代
10. `server.Security` 為 `SecurityStatusDetail` 而非 slice
11. `server.Repository.PushedAt` 為 `RFC3339Time` 需用 `.Time()` 轉換
11. `CrawlRun` 缺少 `CrawlID`、`FinishedAt`、`SourcesScanned` 等字段

## 驗收標準

- [ ] `internal/crawler/coordinator.go` 編譯通過
- [ ] `internal/crawler/incremental.go` 編譯通過
- [ ] `internal/crawler` 套件編譯通過
- [ ] 爬蟲管線 Run() 函數結構完整，所有階段在 Run 函數內部
- [ ] 所有類型轉換正確：`models.RFC3339Time` ↔ `time.Time`、Level string 轉換、SourceTrustScores 查詢
- [ ] 所有舊字段引用更新：`TopicList`→`Category`、`GetReadme()`→`Readme`、`SourceTrustScores[source]`→`getSourceTrustScore(source)`
- [ ] `go build ./internal/crawler/...` 成功
- [ ] `go test ./internal/crawler/... -v` 通過

## 備註

- 核心模型已完善：models、engines、normalize、scoring、verify、classify、search、evidence、export、security、config、sources、crawler/run 均編譯通過
- 需要重點修復 `internal/crawler/coordinator.go` 的 Run 函數結構，確保所有階段代碼在 Run 函數內部
- `internal/crawler/incremental.go` 和 `storage/store.go` 也有類似類型錯誤需同步修復
- `models.SourceTrustScores` 結構體非 map，需使用 `getSourceTrustScore()` 輔助函數
- `models.SourceTrustScores` 字段：GitHub、Registry、Mcpserversorg、Mcpmarket、GithubRepo
- `models.RFC3339Time` 已添加 `Time()` 和 `IsZero()` 方法
- `models.CrawlRun` 已添加 CrawlID、FinishedAt、SourcesScanned、CandidatesFound 等字段
- 相關任務：T094 (incremental.go 重構)、T095 (storage/store.go 重構)