---
github_issue:
title: Add structured discovery logging for all 4 LoadSources phases
type: feature
priority: medium
status: done
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-04
updated: 2026-08-05
---

# T071 - Structured discovery logging for LoadSources 4-phase pipeline

## 目標
在 `LoadSources()` 的四個 discovery 階段中加入結構化 log，讓使用者能看到每個階段抓到了哪些 free-tier model、中轉站掃描的過程（URL 提取/過濾/健檢）、以及動態模型發現的結果。不寫死輸出格式，使用可注入的 logger interface。

## 背景
目前 `LoadSources()` 四階段完全靜默 — 成功或失敗都沒有任何輸出：

```
① Static Models      → 無 log（哪些 provider 載入了幾個模型？）
② ClawLabs AI Agg    → 無 log（OpenRouter API 回傳幾個免費模型？Pollinations 加了幾個？）
③a. Relay Scanner    → 無 log（爬了幾個 URL？幾個過濾？幾個健檢通過？幾個有模型？）
③b. AutoDiscover     → 無 log（哪些 provider 有額外發現？發現了幾個新模型？）
```

當使用者啟動 `freemodel` 或 `freemodel start` 時，只有一行 `listening on 127.0.0.1:7352`，完全不知道模型清單是從哪裡來的、有沒有任何階段失敗。

唯一有輸出的是 `cmd/testdiscover/main.go`（測試用工具），不是正式功能。

## 驗收標準
- [x] 定義 `DiscoveryLogger` interface（可注入，不寫死 `fmt.Println`），支援 `Info`/`Warn`/`Debug` 三個 level
- [x] 預設 logger 實作：`os.Stderr` 輸出，格式 `[phase] message`，可用 `--quiet` 關閉
- [x] 在 `LoadSources()` 四個階段中插入結構化 log：

### ① Static Models
```
[discovery] phase=static sources=19 total_models=XXX
[discovery] static nvidia: 3 models (nvidia/deepseek-ai/deepseek-v4-pro, ...)
[discovery] static openrouter: free-tier filtered 12→5 models (5 eligible, 7 skipped)
[discovery] static ollama: 0 models (offline/local provider)
```
- 每個 provider 列出 model count
- OpenRouter 顯示過濾前/後的數量
- 沒有模型的 provider 也顯示（標記為 empty）

### ② ClawLabs AI Aggregation
```
[discovery] phase=clawlabs
[discovery] clawlabs fetch_openrouter: GET https://openrouter.ai/api/v1/models → 200, 237 models total, 53 free-tier (pricing=$0/$0)
[discovery] clawlabs fetch_openrouter: 53 free models (google/gemini-2.5-flash:free, nvidia/nemotron-3-ultra-550b-a55b:free, ...)
[discovery] clawlabs static_pollinations: 18 models (pollinations/openai, pollinations/deepseek, ...)
[discovery] clawlabs total: 71 models merged into provider "clawlabs"
```
- HTTP status code + total vs free count
- 前幾個 model ID 示例
- 如果 HTTP 失敗 → `[discovery] clawlabs fetch_openrouter: GET → error: connection refused (skipped)`

### ③a. Relay Scanner
```
[discovery] phase=relay_scan
[discovery] relay_scan v2ex: scraped go/ai → 42 URLs extracted
[discovery] relay_scan v2ex: 38 URLs filtered out (github/js/css/media), 4 relay candidates
[discovery] relay_scan linuxdo: scraped c/ai/analysis → 31 URLs extracted
[discovery] relay_scan linuxdo: 27 URLs filtered out, 4 relay candidates
[discovery] relay_scan dedup: 8 candidates → 5 unique base URLs
[discovery] relay_scan validate https://api.example.com → healthy, 12 models
[discovery] relay_scan validate https://free.example.org → unhealthy (timeout)
[discovery] relay_scan validate https://relay.example.net → healthy, 8 models
[discovery] relay_scan result: 5 tested, 2 healthy, 3 failed → 2 relay providers added (20 models total)
```
- 每個爬蟲來源的 URL 數量
- 過濾統計（多少被排除）
- 去重結果
- 每個候選的健檢結果（healthy + model count / unhealthy + reason）
- 最終彙總

### ③b. AutoDiscover
```
[discovery] phase=autodiscover
[discovery] autodiscover nvidia: GET https://integrate.api.nvidia.com/v1/models → 200, 15 models, +3 new
[discovery] autodiscover groq: GET https://api.groq.com/openai/v1/models → 200, 7 models, +1 new (groq/llama-4-maverick)
[discovery] autodiscover cerebras: GET https://api.cerebras.ai/v1/models → 200, 4 models, 0 new (all already known)
[discovery] autodiscover googleai: GET https://generativelanguage.googleapis.com/v1beta/models → 200, 8 models, +2 new
[discovery] autodiscover result: 4 providers checked, 3 with new models, 6 new models total
```
- 每個 discoverable provider 的 HTTP 狀態、回傳幾個模型、新增幾個
- 如果全是已知模型 → "0 new (all already known)"
- 如果有新模型 → 列出前幾個新增的 model ID
- HTTP 失敗 → `→ error: 503 (skipped)`

### 最終彙總
```
[discovery] summary: 4 phases complete
[discovery] summary: static=XXX models | clawlabs=71 models | relay=20 models (2 sites) | autodiscover=+6 models
[discovery] summary: total registry size: ~140 models across ~22 providers
```

- [x] `go build ./...` 通過
- [x] `go vet ./...` 零警告
- [x] `go test ./...` 全部通過

## 技術設計

### Logger Interface

```go
// internal/providers/logger.go (新)

type LogLevel int
const (
    LevelDebug LogLevel = iota
    LevelInfo
    LevelWarn
    LevelSilent
)

type DiscoveryLogger interface {
    Info(format string, args ...interface{})
    Warn(format string, args ...interface{})
    Debug(format string, args ...interface{})
}

// defaultLogger writes to os.Stderr, prefix "[discovery]"
type defaultLogger struct {
    level LogLevel
    w     io.Writer
}

func NewDefaultLogger(level LogLevel) DiscoveryLogger {
    return &defaultLogger{level: level, w: os.Stderr}
}
```

### Manager 注入

```go
// providers.go
type Manager struct {
    mu        sync.RWMutex
    providers map[string]*Provider
    logger    DiscoveryLogger  // NEW
}

func NewManager() *Manager {
    return &Manager{
        providers: make(map[string]*Provider),
        logger:    NewDefaultLogger(LevelInfo),
    }
}

func (m *Manager) SetLogger(l DiscoveryLogger) {
    m.logger = l
}
```

### CLI 整合

```go
// flags.go
type Options struct {
    // ...
    Quiet bool // --quiet — suppress discovery logs
}

// main.go: buildRegistry()
func buildRegistry() (*models.Registry, *models.TagManager, *providers.Manager, error) {
    provMgr := providers.NewManager()
    
    // Respect --quiet flag
    if opts.Quiet {
        provMgr.SetLogger(providers.NewDefaultLogger(providers.LevelSilent))
    }
    
    provMgr.LoadSources(...)
    provMgr.AutoDiscoverModels()  // log inside this too
    // ...
}
```

### Log 範例位置

以 ③a Relay Scanner 為例，插入點：

```go
// relay_scraper.go: ScannedRelaySites()
func ScannedRelaySites(log DiscoveryLogger) []*RelaySite {
    log.Info("phase=relay_scan starting")
    
    v2exSites := scanV2EXRelaySites(log)
    log.Debug("relay_scan v2ex: %d URLs extracted, %d relay candidates after filter",
        totalExtracted, len(v2exSites))
    
    ldSites := scanLinuxDoRelaySites(log)
    // ...
    
    log.Info("relay_scan dedup: %d candidates → %d unique", totalBeforeDedup, len(unique))
    
    for _, s := range unique {
        healthy := ValidateNewApiRelay(s.BaseURL)
        if healthy {
            models, _ := DiscoverModelsFromRelay(s.BaseURL, ...)
            log.Info("relay_scan validate %s → healthy, %d models", s.BaseURL, len(models))
        } else {
            log.Warn("relay_scan validate %s → unhealthy (skipped)", s.BaseURL)
        }
    }
    
    log.Info("relay_scan result: %d tested, %d healthy, %d failed → %d relay providers",
        tested, healthy, failed, relayCount)
}
```

## 檔案修改

| 檔案 | 變更 |
|------|------|
| `internal/providers/logger.go`（新） | `DiscoveryLogger` interface、`defaultLogger`、`LogLevel` |
| `internal/providers/providers.go` | `Manager.logger` 欄位、`SetLogger()`、`LoadSources()` / `AutoDiscoverModels()` / `fetchFreeOpenRouterModels()` / `fetchClawLabsModels()` / `DiscoverModels()` 插入 log |
| `internal/providers/relay_scraper.go` | `ScannedRelaySites()` / `scanForumRelaySites()` / `ValidateNewApiRelay()` / `DiscoverModelsFromRelay()` 加入 logger 參數與 log |
| `internal/cli/flags.go` | 新增 `--quiet` flag |
| `cmd/freemodel/main.go` | `buildRegistry()` 中注入 logger、傳遞 `opts.Quiet` |

## 邊界情況

| 情境 | Log 行為 |
|------|----------|
| `--quiet` flag | 所有 discovery log 關閉（LevelSilent），只留 router `listening on` |
| HTTP 請求失敗 | Warn level + 原因（timeout/connection refused/status code） |
| OpenRouter API 回傳空 | Info: "0 models returned" |
| 無中轉站被發現 | Info: "relay_scan result: 0 sites found (normal in restricted networks)" |
| Partial failure（部分 provider 成功部分失敗）| 每個失敗的 provider 獨立 Warn，不中斷整體流程 |
| `freemodel --best` 模式 | 同樣顯示 discovery log（使用者需要知道模型來源） |
| Logger 為 nil | 不 panic，跳過所有 log（nil-safe） |

## 備註
- Logger 設計為可替換的 interface，未來可無痛切換到 `log/slog` 結構化 log（JSON 格式）或寫入檔案
- 不依賴任何第三方 logging library — 只用 `fmt.Fprintf` + `io.Writer`
- Info level 適合終端使用者（知道進度），Debug level 適合開發者（完整 raw data），Warn level 標示異常但不中斷
- 預設輸出到 stderr 而非 stdout，因為 `--best` 模式的 stdout 被腳本 parse（只應輸出 model ID）
