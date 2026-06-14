---
github_issue: https://github.com/openclawchen8-lgtm/openclaw-tasks/issues/355
title: "[T011-C] Preferences ⌘, 觸發設定面板"
type: subtask
status: done
assignee: gemini-3-flash-preview
parent: T011
created: 2026-04-25
updated: 2026-04-28（review 更新）
depends: [T011-A]
---

## 目標

讓 ⌘, 觸發設定面板（WebView HTML overlay）開啟。

## 實際修改的檔案

### `main.go`

- `MenuPreferences`（ID=2）callback → `wv.Eval("window.toggleSettingsPanel && window.toggleSettingsPanel()")`
- JS `toggleSettingsPanel()` 函數：切換 settings overlay 顯示/隱藏狀態

## 驗收標準（達成）

- [x] ⌘, 開啟設定面板
- [x] 再按 ⌘, 或 Esc 關閉設定面板
- [x] 其他 menu item 也正確觸發

---

_建立時間：gemini-3-flash-preview | 2026-04-28（review 更新）_