---
github_issue:
title: Break up TUI Model into focused state machines (settings, picker, wizard, search)
type: refactor
priority: medium
status: done
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-04
updated: 2026-08-05
---

# T074 - Break up TUI Model into focused state machines

## 目標
將 `internal/tui/tui.go` 的 `Model` struct（25+ 欄位，混合主畫面/picker/settings/search/wizard 五種狀態）拆分為獨立的狀態機，改善可維護性與可測試性。

## 背景
目前 `Model` struct 包含 25 個欄位：

```go
type Model struct {
    registry, cfg, engine                  // 依賴注入
    width, height                          // 終端尺寸
    selected, searchQuery, searchActive    // 主畫面導航
    sortKey, sortReverse                   // 排序
    tierFilter, providerFilter, codingOnly // 過濾
    intervalMs                             // ping
    showSettings, settingsIndex,           // 設定畫面 (3 fields)
        settingsKeyEdit, settingsKeyBuf
    showHelp                               // 幫助畫面
    pickerOpen, pickerIndex,               // target picker (3 fields)
        pickerMsg, pickerTargets
    quit, paused, pauseUntil, pauseMs      // 全局狀態
}
```

五種狀態（main/settings/picker/help/search）的欄位混在同一 struct 中，`Update()` 用 if-else 分支路由，導致：
- 新增狀態時動輒要加 3-5 個欄位
- 無法對單一狀態獨立測試
- wizard（T067）加入後會更惡化

## 驗收標準
- [x] 定義 `Screen` interface 或使用 Bubble Tea 的 nested model 模式
- [x] 拆分為獨立 models：
  - `MainModel` — 模型表格、導航、排序、過濾
  - `SettingsModel` — 設定畫面互動（承接 T068 實作）
  - `PickerModel` — target agent 選擇器
  - `SearchModel` — 搜尋列輸入
  - `HelpModel` — 幫助畫面
- [x] 頂層 `Model` 僅保留 `registry/cfg/engine` 依賴 + current screen 路由
- [x] 每個子 model 有獨立的 `Init()` / `Update()` / `View()`
- [x] 現有功能完全保持不變（導航、排序、過濾、按鍵快捷鍵）
- [x] `go build ./...` 通過
- [x] `go vet ./...` 零警告
- [x] `go test ./...` 全部通過（尤其是 `tui_render_test.go` 和 `navigate_test.go`）

## 檔案修改
| 檔案 | 變更 |
|------|------|
| `internal/tui/tui.go` | 簡化頂層 `Model`，路由到子 model |
| `internal/tui/main_model.go`（新） | 主畫面邏輯（目前 `handleInput` + `filteredModels`） |
| `internal/tui/settings_model.go`（新） | 設定畫面（從 `handleSettingsInput` 遷移，等待 T068 實作） |
| `internal/tui/picker_model.go`（新） | Target picker（從 `handlePickerInput` 遷移） |
| `internal/tui/render.go` | 維持不變（純視圖函數） |

## 備註
- 不需要引入額外的狀態機 library — Bubble Tea 的 `tea.Model` interface 就是天然的狀態機
- 可以先做最小拆分（main / settings / picker 三個），wizard 在 T067 再新增
- 子 model 之間透過頂層 `Model` 傳遞 `registry` / `cfg` 引用（共享依賴）
