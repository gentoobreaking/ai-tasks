# Free AI Router — T071/T073/T075/T077/T079/T080 完成摘要

**日期：** 2026-08-05
**Commit：** 20bc0bb
**修改檔案：** 11 files changed, 501 insertions(+), 180 deletions(-)

## T071 — Discovery Logging (medium)
- `internal/providers/logger.go` (新)：`DiscoveryLogger` interface（Info/Warn/Debug）+ `defaultLogger`（stderr、prefix `[discovery]`）+ `LogLevel`（Debug/Info/Warn/Silent）+ nil-safe
- `LoadSourcesWithCache`：四個階段結構化 log（static model counts、OpenRouter 過濾前後、ClawLabs HTTP status+count、relay scan per-source URL/extract/filter/validate、autodiscover per-provider status/new models、final summary）
- `relay_scraper.go`：`ScannedRelaySites`/`scanV2EXRelaySites`/`scanLinuxDoRelaySites`/`scanForumRelaySites` 接受 `DiscoveryLogger` 參數
- `cli/flags.go`：`Options.Quiet` + `--quiet` flag
- `main.go`：`buildRegistry` respect `opts.Quiet`

## T073 — BuildRegistry Pipeline Refactor (medium)
- `internal/models/catalog.go`：新增 `ApplyScores(dataPath)`、`ApplyTags(tagMgr, dataPath)`、`ApplyEndpoints(mgr)` 三個 Registry 方法，吸收原 main.go 50+ 行內聯邏輯
- `cmd/freemodel/main.go`：`buildRegistry()` 從 70+ 行簡化為 ~30 行純 pipeline 呼叫；舊 `applyEndpoints()` 函數已刪除
- 已有 `LoadScores`/`LoadTags`/`ComputeTier` 函數封裝 score→tier 映射

## T075 — Config Read-Lock Race Fix (medium)
- `config.go`：`ResolveAPIKey`/`ResolveAPIKeys`/`KeysFromConfig` 對 `cfg.APIKeys` map 讀取加 `cfg.RLock`/`cfg.RUnlock`
- env 檢查部分不加鎖（`os.Getenv` thread-safe）
- `go test -race` 全部 PASS

## T077 — Centralize Provider Definitions (medium)
- `internal/providers/registry.go` (新)：`ProviderMeta` struct + `AllProviders` 17 筆（含 Key/Name/EnvVar/SignupURL/KeyPrefix/Discoverable/BaseURL/APIURL）
- `EnvVarForProvider()` 改查 registry，舊 17-entry envMap 移除
- `tui.go`：`settingsProviders`/`cycleProviderFilter` 動態遍歷 `AllProviders`
- `onboard.go`：改用 `AllProviders` 動態建立 onboard list，刪除 hardcoded `providerSignup`/`signupInfo` map
- `sources.json` 保留不動（向後相容）

## T079 — runBest Return Value Fix (low)
- `cmd/freemodel/main.go`：`_, err = cli.RunBest(...)` → `bestID, err := cli.RunBest(...)`

## T080 — Model Dedup in LoadFromSources (low)
- `catalog.go:LoadFromSources()`：`seen map[string]bool` 去重，重複 model ID 跳過保留第一個 provider

## 驗證結果
- ✅ `go build ./...` 通過
- ✅ `go vet ./...` 零警告
- ✅ `go test -race -short` 6 suites 全 PASS（cli/config/models/ping/targets/tui）
- ✅ 所有 6 個任務書 frontmatter status=done，驗收 checkbox 全 `[x]`
