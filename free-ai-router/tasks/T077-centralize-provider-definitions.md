---
github_issue:
title: Centralize provider definitions into single source of truth
type: refactor
priority: medium
status: pending
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-04
updated: 2026-08-04
---

# T077 - Centralize provider definitions into single source of truth

## 目標
消除 provider 定義散布在 4 個檔案中的問題，集中為單一 provider registry，新增 provider 只需改一個地方。

## 背景
Provider 相關資訊目前分散在四個位置：

| 位置 | 內容 |
|------|------|
| `data/sources.json` | provider 名稱、URL、模型清單 |
| `internal/providers/providers.go:EnvVarForProvider()` | provider → env var 名稱 mapping (17 entries) |
| `internal/cli/onboard.go` | provider 名稱、signup URL、key prefix（hardcoded） |
| `internal/tui/tui.go:settingsProviders()` | provider 名稱、Enabled 狀態（hardcoded list） |
| `internal/tui/tui.go:cycleProviderFilter()` | provider 名稱（部分 hardcoded list） |

問題：
- 新增/移除 provider 需要修改 5 個檔案
- `EnvVarForProvider`、onboard、settings 三個清單可能不同步
- `cycleProviderFilter()` 的 provider 清單只有 7 個，而 settings 有 17 個 — 不一致
- 沒有任何編譯期檢查確保所有清單一致

## 驗收標準
- [ ] 在 `internal/providers/registry.go`（新）定義 `ProviderMeta` struct 與集中式 registry
- [ ] `ProviderMeta` 包含：Key、Name、URL、EnvVar、SignupURL、KeyPrefix、Discoverable
- [ ] 所有現有 provider 的 meta 資料在此定義一次
- [ ] `EnvVarForProvider()` 改為查詢 registry
- [ ] `settingsProviders()` 改為動態遍歷 registry 或 `Manager.GetAllProviders()`
- [ ] `cycleProviderFilter()` 改為動態取得 provider 清單
- [ ] onboard 邏輯可選擇性引用 registry 中的 signup URL 和 key prefix
- [ ] `go build ./...` 通過
- [ ] `go vet ./...` 零警告
- [ ] `go test ./...` 全部通過

## Provider Registry 結構

```go
// internal/providers/registry.go

type ProviderMeta struct {
    Key          string // "nvidia"
    Name         string // "NVIDIA NIM"
    EnvVar       string // "NVIDIA_API_KEY"
    SignupURL    string // "https://build.nvidia.com/explore/discover"
    KeyPrefix    string // "nvapi-"
    Discoverable bool   // true
    BaseURL      string // "https://integrate.api.nvidia.com"
    APIURL       string // "https://integrate.api.nvidia.com/v1/chat/completions"
}

var AllProviders = []ProviderMeta{
    {Key: "nvidia", Name: "NVIDIA NIM", EnvVar: "NVIDIA_API_KEY", ...},
    {Key: "groq", Name: "Groq", EnvVar: "GROQ_API_KEY", ...},
    // ... 17 entries total
}
```

## 檔案修改
| 檔案 | 變更 |
|------|------|
| `internal/providers/registry.go`（新） | ProviderMeta struct + AllProviders slice |
| `internal/providers/providers.go` | `EnvVarForProvider()` 改查 registry |
| `internal/tui/tui.go` | `settingsProviders()` 改用 `Manager.GetAllProviders()` |
| `internal/tui/tui.go` | `cycleProviderFilter()` 動態取得清單 |
| `data/sources.json` | 可保留（向後相容），但不再重複定義 env var |

## 備註
- `sources.json` 保留不動（向後相容），但未來可考慮讓 provider 從 registry 繼承 URL
- 這是準備工作，讓後續 T070（auto-detect keys）和 T068（settings interactions）更容易實作
