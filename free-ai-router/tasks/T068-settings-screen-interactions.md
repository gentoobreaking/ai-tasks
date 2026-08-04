---
github_issue:
title: Implement settings screen keyboard interactions (toggle, edit key, test ping)
type: feature
priority: medium
status: done
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-04
updated: 2026-08-04
---

# T068 - Implement settings screen keyboard interactions

## 目標
補完 TUI 設定畫面（`P` 鍵）的互動功能。目前 `RenderSettings()` 渲染已完整，但 `handleSettingsInput()` 僅支援 ESC/Q 退出和 Ctrl+C 退出 — 所有核心互動（toggle provider、編輯 API key、測試 ping、刪除 key、開啟註冊頁面）皆未實作。

## 背景
`internal/tui/render.go:RenderSettings()` 已渲染：
- Provider 列表（ON/OFF toggle、masked API key、test status）
- 操作提示：`↑↓:navigate  Enter:edit key  Space:toggle  T:test  D:delete  ESC/Q:back`

但 `internal/tui/tui.go:handleSettingsInput()` 僅實作：
```go
case "esc", "q":
    m.showSettings = false
case "ctrl+c":
    m.quit = true
    return m, tea.Quit
```

規範 §6.13 要求完整互動。

## 驗收標準
- [x] **導航**：↑/↓/j/k 選擇 provider（`settingsIndex` 追蹤當前選中項）
- [x] **Toggle (Space)**：切換選中 provider 的 `Enabled` 狀態（更新 `cfg.Providers[name].Enabled`，即時反映在渲染中）
- [x] **Edit Key (Enter)**：
  - 進入 inline 編輯模式（`settingsKeyEdit = true`）
  - 顯示 `settingsKeyBuf` 當前值
  - 輸入字元附加到 buffer，Backspace 刪除，Enter 確認，ESC 取消
  - 儲存到 `cfg.APIKeys[providerName]` 並呼叫 `config.Save(cfg)`
  - Key 格式驗證（prefix check），不合法時顯示警告但不拒絕
- [x] **Test Ping (T)**：
  - 對選中 provider 的預設模型執行即時 ping（`pingModelNow()`）
  - 顯示結果（延遲 + HTTP 狀態碼）在 `SettingsProvider.TestStatus`
- [x] **Delete Key (D)**：
  - 刪除選中 provider 的 API key（從 `cfg.APIKeys` 移除）
  - 更新 `SettingsProvider.Key = ""`
- [x] **Open Signup (O)**：
  - 若 provider 無 key，按 O 開啟對應註冊頁面
  - 調用 `openBrowser(signupURL)`（使用 `cli/exec_unix.go` 或 `cli/exec_windows.go` 中的實作）
- [x] 即時反映所有變更到渲染（Bubble Tea `tea.Tick` 或狀態變更後直接重繪）
- [x] `go build ./...` 通過
- [x] `go vet ./...` 零警告
- [x] `go test ./...` 全部通過

## 檔案修改
| 檔案 | 變更 |
|------|------|
| `internal/tui/tui.go` | 擴充 `handleSettingsInput()`，新增 `settingsSelected`、`settingsEditing` 等狀態欄位 |
| `internal/tui/render.go` | 更新 `RenderSettings()` 高亮當前選中項、顯示編輯模式 UI |
| `cmd/freemodel/main.go` | 可能需傳遞 `cfg` 給 `tui.Model`（目前已有 `SetConfig()`） |

## 技術細節

### Provider signup URLs
| Provider | Signup URL |
|----------|-----------|
| nvidia | `https://build.nvidia.com/explore/discover` |
| groq | `https://console.groq.com/keys` |
| cerebras | `https://cloud.cerebras.ai/` |
| openrouter | `https://openrouter.ai/keys` |
| googleai | `https://aistudio.google.com/apikey` |
| opencode | `https://opencode.ai` |
| codestral | `https://console.mistral.ai/` |
| scaleway | `https://console.scaleway.com/` |
| kilocode | `https://kilocode.ai` |
| siliconflow | `https://siliconflow.cn/` |

### Key prefix validation
| Provider | Expected prefix |
|----------|----------------|
| nvidia | `nvapi-` |
| groq | `gsk_` |
| googleai | `AIza` |
| openrouter | `sk-or-` |
| cerebras | `csk-` |

### 狀態模型
```go
type Model struct {
    // ... existing fields ...
    showSettings       bool
    settingsIndex      int       // selected provider index
    settingsKeyEdit    bool      // inline editing mode
    settingsKeyBuf     string    // current edit buffer
    settingsEditFor    string    // provider being edited
}
```

## 備註
- `m.cfg` 已在 `SetConfig()` 中設定，可直接讀寫
- Config 變更後需呼叫 `config.Save(cfg)` 持久化
- 編輯模式下所有鍵盤輸入進入 buffer（除了 Enter/ESC），不需經過 `handleSettingsInput`
- 這個任務讓 `T016` 真正達到 "done" 狀態
