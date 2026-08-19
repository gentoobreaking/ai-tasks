# T072 修復記錄 — 2026-08-04 23:17

## 修復內容

修復了 `AutoDiscoverModels()` 從未被呼叫的 critical bug，順便修正了函數內部的兩個並行 bug。

### 1. `cmd/freemodel/main.go` — 接線

在 `LoadSources()` 之後、`registry.LoadFromSources()` 之前加入 `provMgr.AutoDiscoverModels()` 呼叫。

### 2. `internal/providers/providers.go` — 三個 bug 修復

#### Bug 1: Double-unlock panic
原程式碼：`m.mu.RLock()` + `defer m.mu.RUnlock()` + 顯式 `m.mu.RUnlock()`（第 141 行）
→ defer 觸發時 double unlock → panic

修復：移除 `defer`，手動 `RUnlock()` 後不再 defer

#### Bug 2: Stale pointer（核心問題）
原程式碼：`p := m.GetProvider(key)` 回傳的是 **clone**（值拷貝），後面 `p.Models = append(p.Models, dm)` 寫入的是 clone 而非 `m.providers[key]` → 新發現的模型永遠不會被存儲

修復：在 merge 階段直接用 `m.providers[key]`（在寫鎖內）

#### Bug 3: nil-safety
原程式碼：`p := m.GetProvider(key); if p != nil ... { m.mu.Lock(); if p != nil { ... } }` — 第二次 nil check 是多餘的（p 不會在鎖外變成 nil）

修復：簡化為 `prov, ok := m.providers[key]` 直接在寫鎖內存取

## 驗證
- `go build ./...` ✅
- `go vet ./...` ✅ 零警告
- `go test ./...` ✅ 全部 8 個測試套件通過
