# T065/T066/T067 完成記錄 — 2026-08-05 00:00

## T065 — TUI dead file cleanup ✅

| 檔案 | 行數 | 動作 | 引用檢查 |
|------|------|------|----------|
| internal/tui/colors.go | 63 | 刪除 | zero refs |
| internal/tui/input.go | 180 | 刪除 | zero refs |
| internal/tui/primitives.go | 162 | 刪除 | `truncate()`→render.go inline |

修復：`truncateStr()` 原本 delegation 到 `primitives.truncate()`，改為 rune-safe 內聯實作。

## T066 — Pollinations /text router hook ✅

### Router 修改（routing.go）
- `forward()` 新增分支：`m.Provider=="pollinations" && m.APIKey==""` → `forwardPollinationsText()`
- `forwardPollinationsText()`: ConvertOpenAIToPollinations → BuildTextURL → HTTP GET → WrapPollinationsResponse
- Streaming: 單 SSE chunk + `[DONE]`
- 5xx 仍觸發 failover（與 /v1/chat/completions 一致）
- 共用 keep-alive pool（text.pollinations.ai）
- 新增 `writeSSEChunk()` / `writeSSEDone()` helpers

### 測試（router_proxy_test.go）
| 測試 | 結果 |
|------|------|
| TestPollinationsTextFallback | ✅ live: 200 + JSON |
| TestPollinationsTextFallbackInvalidBody | ✅ 400 |
| TestPollinationsTextWithAPIKeyRoutesNormally | ✅ /v1 path |
| TestPollinationsTextStreaming | ✅ live: SSE data: + [DONE] |

## T067 — TUI first-run wizard ✅

### 新增 wizard.go（~420 lines）
- `WizardModel` — Bubble Tea 狀態機：Welcome → Providers → KeyEntry → Done
- `isFirstRun()` — 檢測無 config 或無 API keys
- Provider 流程：
  - [O] 開瀏覽器 + 輸入 key
  - [E] 手寫 key（masked）
  - [S] 跳過
- Key prefix 驗證（nvidia=`nvapi-`, groq=`gsk_`, google=`AIza`, openrouter=`sk-or-` 等）
- 完成後自動儲存 config + 進主 TUI
- 中途 Ctrl+C → 保留已收集的 keys

### tui.go 整合
- Model 新增 `wizardActive` / `wizard` 欄位
- Update() / View() 在 wizard 啟用時 delegate 到 WizardModel
- Wizard 完成後 `WizDone` → 寫 cfg.APIKeys + config.Save() → 切回正常 View

## 驗收匯總

| 檢查 | 結果 |
|------|------|
| go build ./... | ✅ |
| go vet ./... | ✅ 零警告 |
| go test -count=1 ./... | ✅ 8 suites PASS |
| Git commit | `63126a0` |
