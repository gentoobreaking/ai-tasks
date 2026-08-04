---
github_issue:
title: Refactor buildRegistry from god function into composable pipeline
type: refactor
priority: medium
status: pending
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-04
updated: 2026-08-04
---

# T073 - Refactor buildRegistry into composable pipeline

## 目標
將 `cmd/freemodel/main.go:buildRegistry()` 拆分為獨立的、可測試的 pipeline steps，解決當前 god function 問題（70+ 行、混合 provider 載入/scores/tags/endpoints 多層邏輯）。

## 背景
`buildRegistry()` 是整個應用最關鍵的初始化函數，但目前它：
- 直接在 main.go 中做 model 遍歷與 mutation
- Scores 載入邏輯（`splitN(m.ID, "/", 2)` 三次 fallback）內嵌在 main.go
- Tags 載入與合併內嵌在 main.go
- `applyEndpoints()` 作為頂層函數定義在 main.go
- 無法對 pipeline 的任一步驟做單元測試

這違反了 Go 的 package 設計原則 — `cmd/freemodel/` 應該是薄層的 CLI entry point，而非核心業務邏輯。

## 驗收標準
- [ ] 將 `LoadScores()` → `ComputeTier()` 的迴圈移到 `internal/models/` 的新方法
- [ ] 將 `LoadBuiltIn()` → tag 合併的邏輯移到 `internal/models/` 的新方法
- [ ] 將 `applyEndpoints()` 移到 `internal/models/` 或 `internal/providers/`
- [ ] `buildRegistry()` 簡化為 pipeline 呼叫串：
  ```go
  provMgr.LoadSources(path)
  provMgr.AutoDiscoverModels()        // T072 修復
  registry.LoadFromSources(provMgr)   // 現有
  registry.LoadScores(dataPath)       // 新：封裝 score loading
  registry.LoadTags(dataPath)         // 新：封裝 tag loading
  registry.ApplyEndpoints(provMgr)    // 新：封裝 endpoint setup
  ```
- [ ] 每個 pipeline step 都有對應的單元測試
- [ ] `go build ./...` 通過
- [ ] `go vet ./...` 零警告
- [ ] `go test ./...` 全部通過
- [ ] `cmd/freemodel/main.go` 的 `buildRegistry()` 不超過 30 行

## 檔案修改
| 檔案 | 變更 |
|------|------|
| `internal/models/catalog.go` | 新增 `LoadScores(dataPath)`、`LoadTags(dataPath)`、`ApplyEndpoints(provMgr)` 方法 |
| `internal/models/catalog_test.go` | 新增 pipeline step 單元測試 |
| `cmd/freemodel/main.go` | 簡化 `buildRegistry()` 為 pipeline 呼叫串 |
| `cmd/freemodel/main.go` | 移出 `applyEndpoints()` 函數 |
