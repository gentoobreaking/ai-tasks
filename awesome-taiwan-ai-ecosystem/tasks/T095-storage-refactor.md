---
github_issue: N/A
title: Storage Store 重構 - 適配新 Entity 模型與存儲邏輯修復
type: refactor
priority: high
status: done
assignee: pi with opencode
created: 2026-09-05
depends_on: []
updated: 2026-09-05
---

# T095 - Storage Store 重構 - 適配新 Entity 模型與存儲邏輯修復

## 目標

重構 `internal/storage/store.go` 以完全適配新的 Entity 模型架構，修復存儲層編譯錯誤。

主要問題：
1. `server.Security` 為 `models.SecurityStatusDetail` 非 slice，需用 `.Findings` 迭代
2. `server.TaiwanRelevance.Level` 為 `models.TaiwanRelevanceLevel` 需轉字串比較
3. `CrawlRun` 缺少字段：`CrawlID`、`FinishedAt`、`SourcesScanned`、`CandidatesFound`、`CandidatesNorm`、`DuplicatesRemoved`、`TaiwanCandidates`、`Verified`、`Failed`
4. `models.CrawlRun` 結構體缺少字段：`CrawlID`、`FinishedAt`、`SourcesScanned`、`CandidatesFound`、`CandidatesNorm`、`DuplicatesRemoved`、`TaiwanCandidates`、`Verified`、`Failed`
5. `server.Repository.PushedAt` 為 `models.RFC3339Time` 需用 `.Time()` 轉換
6. `server.TaiwanRelevance.Level` 為 `models.TaiwanRelevanceLevel` 需轉字串比較
7. `server.Security` 為 `models.SecurityStatusDetail` 非 slice，需用 `.Findings` 迭代
8. `models.CrawlRun` 缺少字段：`CrawlID`、`FinishedAt`、`SourcesScanned`、`CandidatesFound`、`CandidatesNorm`、`DuplicatesRemoved`、`TaiwanCandidates`、`Verified`、`Failed`
9. `run.CrawlID`、`run.FinishedAt`、`run.SourcesScanned`、`run.CandidatesFound`、`run.CandidatesNorm`、`run.DuplicatesRemoved`、`run.TaiwanCandidates`、`run.Verified`、`run.Failed` 字段缺失

## 驗收標準

- [x] `internal/storage/store.go` 編譯通過
- [x] `go build ./internal/storage/...` 成功
- [x] `go test ./internal/storage/... -v` 通過
- [x] `models.CrawlRun` 結構體包含所有必要字段
- [x] 所有類型轉換正確：`models.RFC3339Time` ↔ `time.Time`、Level string 轉換、Security.Findings 迭代

## 備註

- 依賴 T093、T094 完成
- `models.CrawlRun` 已添加 CrawlID、FinishedAt、SourcesScanned、CandidatesFound 等字段
- `models.RFC3339Time` 已添加 `Time()` 和 `IsZero()` 方法
- 需要將 `server.TaiwanRelevance.Level == level` 改為 `string(server.TaiwanRelevance.Level) == level`
- 需要將 `server.Security` 迭代改為 `server.Security.Findings`
- 需要將 `server.Repository.PushedAt` 改為 `server.Repository.PushedAt.Time()`
- 相關任務：T093 (coordinator.go 重構)、T094 (incremental.go 重構)