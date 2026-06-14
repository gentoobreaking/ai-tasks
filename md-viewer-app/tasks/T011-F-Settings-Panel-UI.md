---
github_issue: https://github.com/openclawchen8-lgtm/openclaw-tasks/issues/358
title: "[T011-F] Settings Panel UI"
type: subtask
status: done
assignee: gemini-3-flash-preview
parent: T011
created: 2026-04-25
updated: 2026-04-28（review 更新）
depends: [T011-C, T011-D]
---

## 目標

在 WebView 內建立 Settings Panel UI（HTML overlay + 各種控制項）。

## 實際修改的檔案

### `main.go`（htmlTemplate + JS）

Settings Panel HTML overlay 包含：

- **主題選擇**：auto / light / dark / sepia / solarized / nord
- **縮放靈敏度**：range slider（1-10）
- **字型**：系統預設 / 蘋方+雅黑 / 思源+文泉 / 襯線 / 等寬
- **字型大小**：14px / 16px / 18px / 20px
- **語言**：繁中 / 簡中 / English / 日本語 / 한국어
- **顯示行號**：checkbox

JS 事件處理：

- `themeSelect` change → `applyTheme()` + `saveTheme()`
- `zoomSensitivity` input → `applyZoomSensitivity()` + `saveZoomSensitivity()`
- `fontFamily` change → `saveFont()`（同時寫入 fontSize）
- `fontSize` change → `saveFont()`（同時寫入 fontFamily）
- `language` change → `applyLanguage()` + `saveLanguage()`
- `showLineNumbers` change → `applyLineNumbers()` + `saveLineNumbers()`

開啟面板時同步顯示目前設定值（fix T011-FIX-03）。

## 驗收標準（達成）

- [x] 設定面板有視覺美感（與 app 主題一致）
- [x] 所有控制項可正常操作
- [x] 關閉按鈕（×）可關閉面板
- [x] ESC 鍵可關閉面板
- [x] 開啟面板時正確顯示目前設定值

---

_建立時間：gemini-3-flash-preview | 2026-04-28（review 更新）_