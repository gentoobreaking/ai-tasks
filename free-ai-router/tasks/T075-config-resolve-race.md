---
github_issue:
title: Fix ResolveAPIKey config read without lock → potential race
type: bugfix
priority: medium
status: pending
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-04
updated: 2026-08-04
---

# T075 - Add read-lock to ResolveAPIKey config access

## 目標
修復 `config.ResolveAPIKey()` 和 `config.ResolveAPIKeys()` 直接讀取 `cfg.APIKeys` 而不加讀鎖的 thread-safety 問題。

## 背景
`Config` struct 自帶 `sync.RWMutex`（`mu` 欄位），提供 `Lock()/Unlock()/RLock()/RUnlock()` 方法。API handler（例如 `POST /api/config`）可能透過 `config.Save()` 寫入 config，同時 router 在 `r.ServeChatCompletions()` 中透過 `model.APIKey`（在 `runServer` 時已 resolve）來使用 key。

雖然 `runServer` 和 `runTUI` 中是在 startup 一次性 resolve 所有 models 的 APIKey（`m.APIKey = config.ResolveAPIKey(m.Provider, cfg)`），但在 `settingsProviders()` 中每次 render 都會呼叫 `config.ResolveAPIKey(name, m.cfg)`。

如果 settings screen（TUI 的 `P` 鍵）和 API handler 並行修改 config，`ResolveAPIKey` 對 `cfg.APIKeys` 的 map 讀取會有 race condition。

**影響：** 理論上的 data race（`go test -race` 可能檢測到），但目前 production 場景罕見（TUI mode 和 server mode 互斥）。

## 驗收標準
- [ ] `ResolveAPIKey()` 和 `ResolveAPIKeys()` 內對 `cfg.APIKeys` 的讀取加 `cfg.RLock()` / `cfg.RUnlock()`
- [ ] `KeysFromConfig()` 同樣加讀鎖
- [ ] 確認不影響效能（讀鎖成本極低）
- [ ] `go build -race ./...` 通過
- [ ] `go vet ./...` 零警告
- [ ] `go test -race ./...` 全部通過

## 修改位置

**檔案：** `internal/config/config.go`

```go
func ResolveAPIKey(provider string, cfg *Config) string {
    // env check first (no lock needed — os.Getenv is thread-safe)
    for _, env := range EnvOverrides { ... }

    // ADD: read-lock for config map access
    cfg.RLock()
    defer cfg.RUnlock()

    keys, ok := cfg.APIKeys[provider]
    // ... rest unchanged
}
```

## 備註
- 三個函數需要修改：`ResolveAPIKey`、`ResolveAPIKeys`、`KeysFromConfig`
- env 檢查部分不需要鎖（`os.Getenv` 在 Go 中是 thread-safe 的）
- 這是防禦性修復 — 目前實際觸發場景很少
