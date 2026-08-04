---
github_issue:
title: Complete first-run wizard inside TUI (post Bubble Tea refactor)
type: feature
priority: medium
status: done
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-04
updated: 2026-08-05
---

# T067 - Complete first-run wizard inside TUI after Bubble Tea refactor

## 目標
在 TUI 內部實作完整的首次執行精靈（first-run wizard），取代目前僅有 CLI `onboard` 子命令的現狀。使用者第一次執行 `freemodel`（無 config 檔案時）應自動進入互動式引導流程。

## 背景
T016（Settings Screen & First-Run Wizard）標記為 done，但實際上 first-run wizard 僅實作了 CLI 路徑（`cli.RunOnboard()`）。TUI 內部的 `handleSettingsInput()` 是最小實作（僅支援 ESC/q 退出）。

規範 §6.12 要求：
- Welcome screen with ASCII art
- Per-provider: "Open browser + enter key" / "Enter key manually" / "Skip"
- Auto-open signup URL for selected provider
- Key format validation (prefix check)
- Save config and start TUI

TUI 重構到 Bubble Tea 後，需要重新實作完整的 wizard flow。

## 驗收標準
- [x] 在 `tui.Run()` 中檢測是否為首次執行（config 不存在或所有 provider 無 key）
- [x] 實作 welcome screen：ASCII art logo + 簡介文字
- [x] 實作 provider-by-provider 引導流程：
  - 顯示 provider 名稱、描述、免費 tier 資訊
  - 三個選項：Open Browser (O)、Enter Key Manually (E)、Skip (S)
  - Open Browser: 調用 `openBrowser(signupURL)` 開啟註冊頁面
  - Enter Key: 顯示文字輸入框（masked），驗證 key 格式（prefix check）
  - 每個 provider 完成後自動進入下一個
- [x] Wizard 完成後自動儲存 config 並進入正常 TUI 模式
- [x] 支援中途退出（Ctrl+C）
- [x] `go build ./...` 通過
- [x] `go vet ./...` 零警告
- [x] `go test ./...` 全部通過

## 完成摘要 (2026-08-05, 63126a0)

### 新增 wizard.go (~420 lines)
- `WizardModel` — Bubble Tea 狀態機：Welcome → Providers → KeyEntry → Done
- `isFirstRun()` — 檢測無 config 或無 API keys
- Provider-by-provider 流程：
  - [O] 開瀏覽器（openBrowser） + 輸入 key
  - [E] 手寫 key（masked •••）
  - [S] 跳過
- Key prefix 驗證：nvidia=`nvapi-`, groq=`gsk_`, google=`AIza`, openrouter=`sk-or-` 等
- 完成後自動 `config.Save()` + 切回主 TUI View
- Ctrl+C 中途退出 → 保留已收集 keys

### tui.go 整合
- Model 新增 `wizardActive bool` + `wizard *WizardModel`
- Update() / View() 在 wizardActive 時 delegate 到 WizardModel
- WizDone → 寫 cfg.APIKeys + 切回正常 View

### 驗證
- go build ./... ✅
- go vet ./... ✅ 零警告
- go test -count=1 ./... ✅ 全部 8 suites PASS
