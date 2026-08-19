# Free AI Router — T068/T069/T070/T078 完成摘要

**日期：** 2026-08-05
**Commit：** b90b846
**修改檔案：** 11 files changed, 838 insertions, 42 deletions

## T068 — Settings Screen 鍵盤互動 (medium)

**主要實作：**
- `internal/tui/tui.go`: `handleSettingsInput()` 完全重寫，支援：
  - ↑↓/jk 導航，`>` 標記選中行（灰色背景高亮）
  - Space toggle 每個 provider 的 Enabled 狀態，即時寫入 config
  - Enter 進入 inline key 編輯模式（Backspace/Enter/ESC）
  - T 對選中 provider 的第一個模型進行 ping 測試
  - D 從 config 刪除 API key
  - O 開啟瀏覽器 signup 頁面
- `internal/tui/render.go`: `RenderSettings()` 新增 `selectedIndex`、`keyEdit`、`keyBuf`、`message` 參數，支援選中高亮、inline 編輯、提示訊息
- 新增輔助函數: `signupURL()`、`pingModelNowTUI()`、`maskKeyInline()`
- 修正 `RenderSettings()` 中的重複 provider name 列印問題
- 所有變更即時反映，透過 Bubble Tea 狀態更新自動重繪

## T069 — Provider Cache Persistence (high)

**主要實作：**
- `internal/providers/cache.go` (新檔案, 141 行):
  - `ProviderCache` 結構：version=1、cached_at、sources_hash、ttl_minutes、stats、providers
  - `loadCache()`: 從 `data/merged-cache.json` 讀取，驗證 hash + TTL + version
  - `saveCache()`: 將 provider map 序列化為 JSON，寫入 0600 權限檔案
  - `restoreFromCache()`: 從快照回復記憶體 provider map（跳過所有 HTTP）
  - `DefaultCacheTTL` 可導出變數 (60 min)
- `internal/providers/providers.go`:
  - 新增 `LoadSourcesWithCache()`: 支援快取讀取與強制刷新
  - 完整 discovery 後自動呼叫 `saveCache()`
  - 修正鎖管理（defer Unlock，cache restore 後直接 return）
- `cmd/freemodel/main.go`:
  - `buildRegistry()` 接受 `refresh` + `useCache` 參數
  - 所有呼叫點傳遞 `opts.Refresh`、`!opts.NoCache`
- `internal/cli/flags.go`: 新增 `--refresh` 與 `--no-cache` CLI flag
- `.gitignore`: 新增 `data/merged-cache.json`

## T070 — Auto-Detect API Keys (high)

**主要實作：**
- `internal/config/autodetect.go` (新檔案, 280 行):
  - `AutoDetectKeys()`: 雙層偵測 — Shell RC → Agent configs
  - `ParseShellRCs()`: 掃描 6 個 shell 設定檔，regex 解析 `export VAR=value`
  - `ParseAgentConfigs()`: 掃描 opencode.json/openclaw.json/pi.json
  - `parseOpenCodeConfig()`: 遞迴 JSON walk，搜尋 `apiKey` + `baseURL` 物件
  - `parseOpenClawConfig()`: 逐行掃描 YAML，偵測 provider block + apiKey 行
  - `guessProviderFromObject()` / `guessProviderFromURL()`: 從 baseURL 推斷 provider
  - `KeySources` table: 每個 provider 1-2 候補 env var 名稱
  - 關鍵修正: opencode 支援 `ZEN_OPENCODE_API_KEY` 備選、googleai 支援 `GEMINI_API_KEY`
- `internal/config/config.go`:
  - Config 新增 `AutoDetectKeys` 欄位 (預設 true)
  - `ResolveAPIKey()` 第三層 fallback: auto-detect (via `detectOnce.Do(`)
  - 全域 `detectOnce` + `detectedKeys` cache 到 process 結束
  - 安全性: auto-detect 結果僅在記憶體中使用，不自動寫入 config file

## T078 — /api/health + /api/status Endpoints (high)

**主要實作：**
- `internal/router/server.go`:
  - Server struct 新增 `startTime time.Time` 欄位
  - `handleAPIHealth()`: GET /api/health → `{"status":"ok","uptime_seconds":N}`
  - `handleAPIStatus()`: GET /api/status → 模型摘要 JSON:
    - total_models / models_up / models_down / models_pending
    - best_model (id/provider/avg_latency_ms)
    - providers breakdown (up/total per provider)
    - avg_latency_ms / uptime_pct / free_tier_only
  - computeStatusSummary 單次遍歷 registry.Snapshot()

## 驗證結果
- ✅ go build ./... 通過
- ✅ go vet ./... 零警告
- ✅ go test -short 全部 6 套件通過 (cli/config/models/ping/targets/tui)
- ✅ providers 單元測試通過（排除 HTTP 整合測試）
