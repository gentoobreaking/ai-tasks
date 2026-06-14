---
github_issue: https://github.com/openclawchen8-lgtm/openclaw-tasks/issues/361
title: "[T011-FIX-05] Zoom 三個附帶 Bug 修復"
type: subtask
status: done
assignee: 碼農1號
parent: T011
created: 2026-04-26
updated: 2026-04-28（review 更新）
---

## 目標

修復 T011-FIX-01 修復 zoom 後意外造成的三個問題。

## 實際修改

### Bug 1：底部 bar zoom % 顯示異常

- **根因**：`showZoomIndicator` fade-out 時覆蓋了 `keyboardHint` 文字
- **修復**：`showZoomIndicator` 更新 `keyboardHint` 時使用完整含 `%` 的動態文字

### Bug 2：⌘, 無法關閉設定面板

- **根因**：`toggleSettingsPanel` 在 IIFE 內定義但未掛上 `window.`
- **修復**：直接宣告為 `window.toggleSettingsPanel = function() {...}`

### Bug 3：⌘S label 顯示「⌘S Settings」

- **根因**：`keyboard-hint` div 文字內容寫死
- **修復**：移除多餘的「Settings」文字

## 驗收標準（達成）

- [x] 底部 bar 正確顯示當前 zoom %
- [x] ⌘, / Esc / × 正確開關設定面板
- [x] `go build` 無錯誤

---

_建立時間：碼農1號 | 2026-04-28（review 更新）_