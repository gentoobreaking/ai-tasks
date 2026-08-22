---
github_issue: ""
title: "TUI persist column sort preference across sessions"
type: pending
priority: medium
status: pending
depends_on: []
assignee: "OpenCode with DeepSeek V4 Flash"
created: "2026-08-22"
updated: "2026-08-22"
---

# T085 - TUI persist column sort preference across sessions

## 目標
記住使用者偏好的排序欄位與方向，下次啟動 TUI 時自動套用，避免每次重新點擊排序。

## 驗收標準
- [ ] 在 config 中新增 `ui.sortKey`（預設 `status`）與 `ui.sortReverse`（預設 `false`）
- [ ] TUI 啟動時讀取 config，自動套用排序
- [ ] 使用者按鍵 0-9 切換排序欄位時，即時更新 config 並持久化
- [ ] 排序指示器（▲/▼）正確顯示當前方向
- [ ] `freemodel config export` 包含排序偏好，import 可還原

## 備註
- 修改位置：`internal/config/config.go`（UIConfig 新增欄位）、`internal/tui/table.go`（排序邏輯）、`internal/tui/tui.go`（啟動時套用）
- 現有 `SortModels` 已支援 `sortKey` + `reverse`，直接複用
- 配置寫入頻率較高，建議 debounce 500ms 批次存檔，避免頻繁 I/O
- 需處理舊配置檔遷移（`normalizeConfig` 設定預設值）