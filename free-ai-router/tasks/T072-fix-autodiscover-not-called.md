---
github_issue:
title: Fix AutoDiscoverModels not being called — dynamic model discovery is dead code
type: bugfix
priority: critical
status: done
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-04
updated: 2026-08-04
---

# T072 - Fix AutoDiscoverModels not being called

## 目標
修復 `providers.Manager.AutoDiscoverModels()` 從未被呼叫的 bug，使 discoverable provider 的動態模型發現功能實際生效。

## 背景
`internal/providers/providers.go` 中定義了 `AutoDiscoverModels()`（第 132 行），邏輯完整：

```go
func (m *Manager) AutoDiscoverModels() {
    // 對每個 Discoverable=true 且 BaseURL!="" 的 provider
    // 發送 GET {BaseURL}/v1/models
    // 合併新模型進 p.Models (去重)
}
```

但在 `cmd/freemodel/main.go:buildRegistry()` 中，`LoadSources()` 之後**直接呼叫 `registry.LoadFromSources(provMgr)`**，完全跳過了 `AutoDiscoverModels()`。

**影響：** 所有 discoverable provider（nvidia、groq、cerebras、googleai 等）的 API 端點動態發現永遠不會執行。使用者只能看到 `sources.json` 中靜態定義的模型，即使上游新增了免費模型也無法自動發現。

## 驗收標準
- [x] `buildRegistry()` 中在 `LoadSources()` 之後、`registry.LoadFromSources()` 之前呼叫 `provMgr.AutoDiscoverModels()`
- [x] 確認不會引入 race condition（`AutoDiscoverModels` 內部有自己的鎖處理）
- [x] go vet -race ✓（零 data race）
- [x] `go build ./...` 通過
- [x] `go vet ./...` 零警告
- [x] `go test -count=1 ./...` 全部 8 套件通過

## 修復摘要 (2026-08-04)

**接線：** `cmd/freemodel/main.go:79` — `provMgr.AutoDiscoverModels()`

**三個 bug 修正（providers.go:133-168）：**
1. Double-unlock panic — 移除 defer，改手動 RUnlock
2. Stale pointer — merge 階段改用 `m.providers[key]` 直接寫入而非 GetProvider clone
3. 簡化 nil-safety — 用 `prov, ok := m.providers[key]` 在寫鎖內直接讀取

**Commit:** `24b4427` — fix(T072): wire AutoDiscoverModels + fix double-unlock & stale-pointer bugs

## 修改位置

**檔案：** `cmd/freemodel/main.go`

```go
// 目前 (錯誤)：
provMgr.LoadSources(...)
registry := models.NewRegistry()
registry.LoadFromSources(provMgr)

// 修正後：
provMgr.LoadSources(...)
provMgr.AutoDiscoverModels()  // ← 新增這行
registry := models.NewRegistry()
registry.LoadFromSources(provMgr)
```

## 備註
- 這是 critical bug — `AutoDiscoverModels` 是 SPEC 定義的功能，但從未被接線
- `AutoDiscoverModels` 內部用 `m.GetProvider()` 取得 clone，不持有長時間鎖，安全
- 此修復後，nvidia/groq/cerebras/googleai 等 provider 在啟動時會自動查詢最新模型清單
