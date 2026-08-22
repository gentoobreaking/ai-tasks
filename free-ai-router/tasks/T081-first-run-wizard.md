---
github_issue: ""
title: "First-run wizard enhancement: guided quick-start with env var detection"
type: pending
priority: high
status: done
depends_on: []
assignee: "OpenCode with DeepSeek V4 Flash"
created: "2026-08-22"
updated: "2026-08-22"
---

# T081 - First-run wizard enhancement: guided quick-start with env var detection

## 目標
增強首次運行體驗，讓使用者無需手動配置即可快速上手。Wizard 應自動偵測環境變數（如 `NVIDIA_API_KEY`、`GROQ_API_KEY` 等）並預填配置，顯示哪些 provider 可立即使用（綠色）vs 需要設定（黃色），並提供「使用 Pollinations（無需 key）」的一鍵零配置選項。

## 驗收標準
- [x] Wizard 啟動時自動掃描所有支援的環境變數（參考 `internal/config/config.go` 的 `EnvOverrides`）
- [x] 對每個 provider 顯示狀態：🟢 Ready (key found) / 🟡 Needs setup / ⚪ Optional
- [x] 提供「Use Pollinations (no key needed)」選項，一鍵啟用 18 個免費模型
- [x] 使用者可勾選/取消勾選要啟用的 provider，完成後自動寫入 `~/.freemodel-router.json`
- [x] Wizard 完成後直接進入 TUI 主畫面，無需重啟

## 備註
- 修改位置：`internal/tui/wizard.go`、`internal/tui/tui.go`（`isFirstRun` 邏輯）
- 需要新增 provider 狀態檢查函數，可複用 `config.ResolveAPIKey` 邏輯
- 注意向後相容：現有配置檔不應被覆蓋