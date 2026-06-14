---
github_issue: https://github.com/openclawchen8-lgtm/openclaw-tasks/issues/356
title: "[T011-D] Config 持久化"
type: subtask
status: done
assignee: gemini-3-flash-preview
parent: T011
created: 2026-04-25
updated: 2026-04-28（review 更新）
depends: [T011-A]
---

## 目標

建立 `~/.md-viewer/config.json` 的讀寫邏輯。

## 實際修改的檔案

### `config.go`（新）

- `LoadConfig()`：啟動時讀取，不存在則建立預設值並寫入磁碟
- `saveConfig()`：變更時寫回磁碟
- `ConfigToJS()`：輸出 `window.mdConfig = {...}` JS 注入字串
- `SetZoomSensitivity` / `SetTheme` / `SetZoomLevel` / `SetFont` / `SetLanguage` / `SetLineNumbers`

### `~/.md-viewer/config.json` 結構（實際）

```json
{
  "zoomSensitivity": 5,
  "theme": "auto",
  "zoomLevel": 1.0,
  "fontFamily": "-apple-system, BlinkMacSystemFont, ...",
  "fontSize": 16,
  "language": "zhTW",
  "showLineNumbers": false
}
```

## 驗收標準（達成）

- [x] app 啟動時 config 檔案存在（自動建立）
- [x] 設定變更時寫回磁碟
- [x] 重開 app 後設定保留

---

_建立時間：gemini-3-flash-preview | 2026-04-28（review 更新）_