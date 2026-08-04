---
github_issue:
title: Cache merged provider sources to disk for fast cold-start and offline resilience
type: feature
priority: high
status: done
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-04
updated: 2026-08-04
---

# T069 - Cache merged provider sources to disk

## 目標
將 `LoadSources()` 三條 discovery 路徑（Static + ClawLabs + Dynamic）合併後的結果快取到磁碟，解決每次冷啟動都要跑 5-8 個 HTTP round-trip 的問題，同時提供離線 fallback 能力。

## 背景
目前 `LoadSources()` 產生的 `Manager.providers` 全在記憶體中，沒有任何持久化。每次啟動流程：

```
LoadSources()
  ├─ [1] 讀 data/sources.json（本地，快）
  ├─ [2] fetchFreeOpenRouterModels() → HTTP GET openrouter.ai/api/v1/models（~300ms）
  ├─ [3] ScannedRelaySites() → HTTP 爬 V2EX + linux.do（~3-8s）
  ├─ [4] ValidateNewApiRelay() → HTTP GET 每個中轉站 /v1/models（每個 ~2s）
  └─ [5] AutoDiscoverModels() → HTTP GET 每個 discoverable provider（~1s each）
```

**問題：**
- 每次冷啟動 5-15 秒 HTTP 等待
- 無網路環境完全無法取得 ClawLabs 模型 + 中轉站
- 頻繁重啟可能觸發 OpenRouter API rate limit
- 開發/測試時浪費頻寬

## 驗收標準
- [x] `LoadSources()` 完成後將完整 `Manager.providers` 序列化到 `data/merged-cache.json`
- [x] 快取結構含 `cached_at` timestamp、`sources_etag`（sources.json 的 hash，偵測 config 變更）、完整 providers map
- [x] 下次 `LoadSources()` 時若快取新鮮（預設 TTL = 1 小時）→ 直接讀快取，跳過所有 HTTP 請求
- [x] 快取過期時：重新執行 HTTP discovery，成功則更新快取；失敗則 fallback 到過期快取（stale-while-revalidate）
- [x] `sources.json` 內容變更時自動 invalidate 快取（比對 SHA256 hash）
- [x] CLI `--refresh` / `--no-cache` flag 強制跳過快取，重新 discovery
- [x] Config 可設定 `cache_ttl_minutes`（預設 60，0 = 永不快取）
- [x] 快取檔案權限 0600（可能含 API endpoint 資訊）
- [x] `go build ./...` 通過
- [x] `go vet ./...` 零警告
- [x] `go test ./...` 全部通過
- [x] 單元測試覆蓋：快取命中、快取過期、快取 invalid、stale fallback、空快取

## 技術設計

### 快取檔案結構

```json
{
  "version": 1,
  "cached_at": "2026-08-04T14:53:00Z",
  "sources_hash": "sha256:abc123...",
  "ttl_minutes": 60,
  "stats": {
    "static_models": 45,
    "clawlabs_models": 84,
    "relay_sites": 2,
    "total_models": 131
  },
  "providers": {
    "nvidia": {
      "key": "nvidia",
      "name": "NIM",
      "url": "https://integrate.api.nvidia.com/v1/chat/completions",
      "discoverable": true,
      "models": [
        {"id": "nvidia/deepseek-ai/deepseek-v4-pro", "label": "DeepSeek V4 Pro", "context": "128k"}
      ],
      "enabled": true,
      "base_url": "https://integrate.api.nvidia.com"
    },
    "clawlabs": { ... },
    "relay-xxx": { ... }
  }
}
```

### 檔案位置

```
data/merged-cache.json  （與 sources.json 同目錄，FREMODEL_DATA_DIR 可覆蓋）
```

### 核心邏輯（pseudocode）

```go
func (m *Manager) LoadSources(path string) error {
    m.mu.Lock()
    defer m.mu.Unlock()

    // 1. Read sources.json (always needed for hash)
    sourcesData, err := os.ReadFile(path)
    sourcesHash := sha256Hex(sourcesData)

    // 2. Try cache first
    if !opts.NoCache {
        cache, err := loadCache(cachePath)
        if err == nil && cache.SourcesHash == sourcesHash && !cache.IsExpired() {
            // Cache hit — restore from disk, skip all HTTP
            m.restoreFromCache(cache)
            return nil
        }
    }

    // 3. Full discovery (existing logic)
    var sources map[string]SourceProvider
    json.Unmarshal(sourcesData, &sources)
    freeOpenRouterModels := m.fetchFreeOpenRouterModels()
    clawLabsModels := m.fetchClawLabsModels()
    // ... rest of LoadSources ...

    // 4. Save cache
    m.saveCache(sourcesHash)
    return nil
}

func (m *Manager) saveCache(sourcesHash string) {
    cache := BuildCacheFromProviders(m.providers, sourcesHash)
    data, _ := json.MarshalIndent(cache, "", "  ")
    os.WriteFile(cachePath, data, 0600)
}
```

### Config 擴充

```go
// config.go
type Config struct {
    // ...
    CacheTTLMinutes int `json:"cache_ttl_minutes"` // 0 = no caching, default 60
}
```

### CLI 擴充

```go
// flags.go
type Options struct {
    // ...
    NoCache   bool // --no-cache / --refresh — skip cache, force re-discovery
    Refresh   bool // alias for --no-cache
}
```

## 檔案修改

| 檔案 | 變更 |
|------|------|
| `internal/providers/providers.go` | 新增 `loadCache()`、`saveCache()`、`restoreFromCache()`、`BuildCacheFromProviders()`；修改 `LoadSources()` |
| `internal/providers/cache.go`（新） | Cache 結構定義、序列化/反序列化、expiry 檢查、sources hash 比對 |
| `internal/providers/cache_test.go`（新） | 快取單元測試 |
| `internal/config/config.go` | 新增 `CacheTTLMinutes` 欄位 |
| `internal/cli/flags.go` | 新增 `--refresh` / `--no-cache` flag |
| `cmd/freemodel/main.go` | 傳遞 `opts.NoCache` 給 `LoadSources()` |

## 邊界情況處理

| 情境 | 行為 |
|------|------|
| 首次執行（無快取） | 完整 discovery → 寫入快取 |
| 快取新鮮 + sources.json 未變 | 直接讀快取，0 個 HTTP 請求 |
| 快取過期 + HTTP 成功 | 重新 discovery → 更新快取 |
| 快取過期 + HTTP 失敗 | **Stale fallback**：載入過期快取 + log warning |
| sources.json 變更（hash mismatch） | 強制重新 discovery，無視快取新鮮度 |
| `--refresh` flag | 跳過快取讀取，強制 discovery（但仍寫入新快取） |
| `cache_ttl_minutes: 0` | 永不使用快取，行為等同目前 |
| 快取檔案損毀 | 刪除損毀快取，fallback 到完整 discovery |
| 部分 provider HTTP 失敗 | 快取仍儲存成功的部分，失敗的 provider 保留舊快取資料 |

## 備註
- OpenRouter `/api/v1/models` 是公開端點（無需 API key），但有 rate limit — 快取可避免頻繁請求被擋
- V2EX/linux.do 爬蟲是整個流程最慢的部分（3-8s），快取後可完全跳過
- 快取不包含 ping 結果（ping 狀態是 runtime 資料，每次啟動重新探測）
- 若未來 provider 模型頻繁變更，可降低 TTL 到 15-30 分鐘
- `data/merged-cache.json` 應加入 `.gitignore`（runtime artifact）
