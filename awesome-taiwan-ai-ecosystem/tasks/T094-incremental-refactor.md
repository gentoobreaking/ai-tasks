---
github_issue: N/A
title: Crawler Incremental 重構 - 適配新 Entity 模型與增量爬蟲邏輯修復
type: refactor
priority: high
status: pending
depends_on: ["T093"]
assignee: pi
created: 2026-09-05
updated: 2026-09-05
---

# T094 - Crawler Incremental 重構 - 適配新 Entity 模型與增量爬蟲邏輯修復

## 目標

重構 `internal/crawler/incremental.go` 以完全適配新的 Entity 模型架構，修復增量爬蟲邏輯中的編譯錯誤。

主要問題：
1. `server.Repository.PushedAt.After` - `models.RFC3339Time` 缺少 `After` 方法
2. 類型轉換：`server.Repository.PushedAt` 為 `models.RFC3339Time` 需用 `.Time()` 轉換
3. `server.TaiwanRelevance.Level` 為 `models.TaiwanRelevanceLevel` 需轉字串比較

## 驗收標準

- [ ] `internal/crawler/incremental.go` 編譯通過
- [ ] `go build ./internal/crawler/...` 成功
- [ ] `go test ./internal/crawler/... -v` 通過
- [ ] `models.RFC3339Time` 添加 `After` 方法或使用 `.Time().After()`
- [ ] 所有類型轉換正確：`models.RFC3339Time` → `time.Time`

## 備註

- 依賴 T093 完成
- `models.RFC3339Time` 已添加 `Time()` 和 `IsZero()` 方法
- 可使用 `server.Repository.PushedAt.Time().After(other.Time())` 替代
- 相關任務：T093 (coordinator.go 重構)、T095 (storage/store.go 重構)