---
github_issue:
title: Auto-detect API keys from shell RC files and agent configs
type: feature
priority: high
status: done
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-04
updated: 2026-08-04
---

# T070 - Auto-detect API keys from shell RC files and agent configs

## 目標
實作智慧 API key 自動偵測，從 shell 設定檔（`.bashrc`、`.zshrc`、`.bash_extend` 等）和已安裝 agent 的 config（OpenCode、OpenClaw、Hermes、Pi）中提取 API key，解決 macOS GUI 啟動 / launchd / IDE 環境下 `os.Getenv()` 拿不到 shell export 變數的問題。

## 背景

### 現狀
目前 `ResolveAPIKey()` 只讀 `os.Getenv(EnvOverrides[i].EnvVar)` — 這只在 binary 從 **已 source shell RC 的 interactive terminal** 啟動時才有效。以下場景拿不到：

| 啟動方式 | `os.Getenv("NVIDIA_API_KEY")` | 結果 |
|----------|-------------------------------|------|
| Terminal: `freemodel` | ✅ 拿到 | 正常 |
| macOS GUI (Finder 雙擊) | ❌ 空 | **無 key** |
| launchd plist | ❌ 空 | **無 key** |
| IDE / VS Code task | ❌ 空 | **無 key** |
| Docker container | ❌ 空 | **無 key** |

### 實際環境範例
使用者 `~/.bash_extend` 中有：
```bash
export NVIDIA_API_KEY="nvapi-KQURA..."
export ANTHROPIC_API_KEY=sk-ant-api03-...
export GEMINI_API_KEY=AQ.Ab8RN...
export DEEPSEEK_API_KEY=sk-0f0b...
export OPENROUTER_API_KEY=sk-or-v1-...
export ZEN_OPENCODE_API_KEY=sk-pW6LN...
```

但目前 `EnvVarForProvider("opencode")` 只查 `OPENCODE_API_KEY`，而使用者的變數是 `ZEN_OPENCODE_API_KEY` — **名稱不匹配**，即使 os.Getenv 能用也拿不到。

### 同時偵測 Agent Config
使用者已安裝 OpenCode（`~/.config/opencode/opencode.json`），其 config 包含 provider API key 資訊。自動偵測時可一併解析。

## 驗收標準
- [x] 實作 `internal/config/autodetect.go` 模組，提供多來源 key 自動偵測
- [x] **Shell RC parser**：解析 `~/.bashrc`、`~/.bash_profile`、`~/.bash_extend`、`~/.zshrc`、`~/.zprofile`、`~/.profile` 中的 `export VAR=value` 行
- [x] **Agent config scanner**：讀取 OpenCode (`opencode.json`)、OpenClaw (`openclaw.json`)、Hermes (`config.yaml`)、Pi (`pi.json`) 中的 API key 設定
- [x] **靈活的 provider↔env mapping**：支援多對多對應（一個 provider 可以有多個候選 env var 名稱、一個 env var 可以對應多個 provider）
- [x] **偵測優先序**：env (`os.Getenv`) > shell RC files > agent configs > config file > empty
- [x] **First-run / onboard 整合**：`onboard` command 顯示自動偵測到的 keys，讓使用者確認後寫入 config
- [x] **Runtime fallback**：`ResolveAPIKey()` 在 config file 和 `os.Getenv()` 都沒有時，自動查 shell RC files 和 agent configs（cache 結果避免重複 parse）
- [x] **`--auto-detect-keys` flag**：CLI flag 強制觸發自動偵測
- [x] **Config 控制**：`config.json` 可設定 `autoDetectKeys: true/false`（預設 true），關閉時只讀 config file + `os.Getenv()`
- [x] 不寫死任何路徑或變數名稱 — 全部透過 mapping table 定義
- [x] `go build ./...` 通過
- [x] `go vet ./...` 零警告
- [x] `go test ./...` 全部通過
- [x] 單元測試：shell RC parsing、agent config parsing、multi-source merge、priority ordering

## 技術設計

### 檔案結構

```
internal/config/
├── config.go          # 現有，修改 ResolveAPIKey() 加入 auto-detect 層
├── autodetect.go     # 新增：auto-detect 主邏輯
├── autodetect_test.go # 新增：測試
└── sources.go        # 新增：shell RC parser + agent config scanner
```

### Provider ↔ Env Var Mapping Table

```go
// sources.go
type KeySource struct {
    Provider    string   // "nvidia", "openrouter", ...
    EnvVarNames []string // ["NVIDIA_API_KEY", "NVAPI_KEY"]
    AgentConfigs []AgentKeySource
}

type AgentKeySource struct {
    Agent      string // "opencode", "openclaw", "hermes", "pi"
    ConfigPath string // "~/.config/opencode/opencode.json"
    KeyPath    string // JSON path: "provider.*.options.apiKey"
}
```

**靈活對應（不寫死單一名稱）**：

| Provider | 主要 env var | 候補 env var | Agent config 來源 |
|----------|-------------|-------------|-------------------|
| nvidia | `NVIDIA_API_KEY` | `NVAPI_KEY` | OpenCode: `provider.*.options.apiKey` |
| openrouter | `OPENROUTER_API_KEY` | — | OpenCode: `provider.*.options.apiKey` |
| opencode | `OPENCODE_API_KEY` | `ZEN_OPENCODE_API_KEY` | OpenCode: `provider.*.options.apiKey` |
| groq | `GROQ_API_KEY` | — | — |
| cerebras | `CEREBRAS_API_KEY` | — | — |
| googleai | `GOOGLE_API_KEY` | `GEMINI_API_KEY` | — |
| anthropic | `ANTHROPIC_API_KEY` | — | OpenClaw: `providers.anthropic.apiKey` |
| deepseek | `DEEPSEEK_API_KEY` | — | — |

### Shell RC 解析

```go
// sources.go
func ParseShellRCs() map[string]string {
    files := []string{
        "~/.bash_extend",
        "~/.bashrc",
        "~/.bash_profile",
        "~/.zshrc",
        "~/.zprofile",
        "~/.profile",
    }
    
    result := make(map[string]string)
    re := regexp.MustCompile(`^export\s+(\w+)=["']?(.+?)["']?\s*$`)
    
    for _, f := range files {
        path := expandPath(f)
        data, err := os.ReadFile(path)
        if err != nil { continue }
        
        for _, line := range strings.Split(string(data), "\n") {
            if matches := re.FindStringSubmatch(line); len(matches) == 3 {
                result[matches[1]] = matches[2]
            }
        }
    }
    return result
}
```

### Agent Config 解析

```go
// 解析 OpenCode opencode.json 遞迴搜尋 apiKey 欄位
func ParseOpenCodeKeys() map[string]string {
    // Read ~/.config/opencode/opencode.json
    // Recursively walk JSON tree
    // For each {"apiKey": "sk-xxx", "baseURL": "https://..."} object:
    //   Try to map baseURL → provider
    //   If baseURL contains "openrouter" → set OPENROUTER_API_KEY
    //   If baseURL contains "nvidia" → set NVIDIA_API_KEY
    // Return map[provider_key]api_key
}
```

### 合併邏輯

```go
// autodetect.go
func AutoDetectKeys() map[string]string {
    result := make(map[string]string)
    
    // Layer 1: os.Getenv (highest priority — already handled in ResolveAPIKey)
    // Layer 2: Shell RC files
    shellVars := ParseShellRCs()
    for _, source := range KeySources {
        for _, envName := range source.EnvVarNames {
            if val, ok := shellVars[envName]; ok && val != "" {
                result[source.Provider] = val
                break
            }
        }
    }
    
    // Layer 3: Agent configs
    agentKeys := ParseAgentConfigs()
    for provider, key := range agentKeys {
        if _, exists := result[provider]; !exists {
            result[provider] = key
        }
    }
    
    return result
}
```

### 整合到 ResolveAPIKey

```go
// config.go — 修改
func ResolveAPIKey(provider string, cfg *Config) string {
    // 1. os.Getenv (existing, unchanged)
    for _, env := range EnvOverrides {
        if env.Provider == provider {
            if val := os.Getenv(env.EnvVar); val != "" {
                return val
            }
        }
    }
    
    // 2. Config file (existing, unchanged)
    if key := keyFromConfig(provider, cfg); key != "" {
        return key
    }
    
    // 3. Auto-detect (NEW — cached after first call)
    if cfg.AutoDetectKeys {
        detectOnce.Do(func() {
            detectedKeys = AutoDetectKeys()
        })
        if key, ok := detectedKeys[provider]; ok {
            return key
        }
    }
    
    return ""
}
```

## 檔案修改

| 檔案 | 變更 |
|------|------|
| `internal/config/autodetect.go`（新） | `AutoDetectKeys()`、`detectOnce`、cache 邏輯 |
| `internal/config/sources.go`（新） | `ParseShellRCs()`、`ParseAgentConfigs()`、`KeySources` table |
| `internal/config/autodetect_test.go`（新） | 單元測試 |
| `internal/config/config.go` | `ResolveAPIKey()` 加入 auto-detect fallback、Config 新增 `AutoDetectKeys` 欄位 |
| `internal/cli/flags.go` | 新增 `--auto-detect-keys` flag |
| `internal/cli/onboard.go` | 自動偵測結果呈現在 onboard wizard 中 |

## 邊界情況

| 情境 | 行為 |
|------|------|
| 無 shell RC 檔案 | 跳過，不報錯 |
| RC 檔案中有語法錯誤的行 | 跳過該行，繼續解析 |
| `export` 後的值含空白 | regex greedy match 到行尾 |
| 同一個 provider 多個來源都有 key | os.Getenv > shell RC > agent config > config file |
| agent config JSON 格式損壞 | 跳過該檔案，log warning |
| `autoDetectKeys: false` | 不執行任何偵測，行為等同目前 |
| 第一次呼叫 `ResolveAPIKey` | 觸發 auto-detect，結果 cache 到 process lifetime |
| Shell RC file 路徑含 `~` | `expandPath()` 展開為 `$HOME` |

## 備註
- **不要寫死**任何路徑 — 所有 shell RC 路徑清單、env var mapping 都定義在 `sources.go` 的 table 中
- `ParseShellRCs()` 只在 `detectOnce.Do()` 內執行一次，結果 cache 到 process 結束
- Agent config 掃描是 best-effort：檔案不存在或格式錯誤就跳過
- OpenCode 的 `opencode.json` 結構是遞迴的（`provider.{name}.options.apiKey`），需要 generic JSON walker
- 考慮安全性：auto-detect 的 keys 只在記憶體中使用，不會自動寫入 config file（除非使用者透過 onboard 確認）
