---
github_issue: https://github.com/openclawchen8-lgtm/openclaw-tasks/issues/360
title: Native NSMenu + 設定面板 + 縮放靈敏度持久化
status: done
assignee: 碼農2號
created: 2026-04-24
updated: 2026-04-25
depends: [T006]
---

## 目標

在 md-viewer-webview 建立 Native macOS NSMenu，含設定面板與縮放靈敏度持久化。

## 子任務

| Task       | 內容                                                     | 狀態    | 負責    |
| ---------- | -------------------------------------------------------- | ------- | ------- |
| **T011-A** | Native NSMenu 骨架（menu.m + menu.go CGO bridge）        | pending | 碼農2號 |
| **T011-B** | 選單結構與 shortcut 綁定（⌘O/⌘Q/⌘+/⌘- 等）               | pending | 碼農2號 |
| **T011-C** | Preferences ⌘, 觸發設定面板                              | pending | 碼農2號 |
| **T011-D** | Config 持久化（`~/.md-viewer/config.json` 載入/儲存）    | pending | 碼農2號 |
| **T011-E** | 設定結構與預設值（zoomSensitivity 1-3、theme）           | pending | 碼農2號 |
| **T011-F** | Settings Panel UI（WebView HTML overlay + range slider） | pending | 碼農2號 |
| **T011-G** | Zoom step 動態套用（根據 config.zoomSensitivity）        | done    |
| **T011-H** | Zoom Level 持久化（重開後還原縮放比例）                  | done    |
| **T011-I** | 字型 + 字型大小持久化                                    | done    |
| **T011-J** | 語言切換（繁中/簡中/英/日/韓）+ i18n UI + NSMenu i18n    | done    |
| **T011-K** | 視窗全螢幕/正常化（⌘F）                                  | done    | 碼農2號 |

## Menu Item ID 對照

| ID  | Menu | Item           | Shortcut |
| --- | ---- | -------------- | -------- |
| 1   | App  | About          | -        |
| 2   | App  | Preferences    | ⌘,       |
| 3   | File | Open           | ⌘O       |
| 4   | File | Reload         | ⌘R       |
| 5   | File | Quit           | ⌘Q       |
| 6   | View | Zoom In        | ⌘+       |
| 7   | View | Zoom Out       | ⌘-       |
| 8   | View | Zoom Reset     | ⌘0       |
| 9   | View | Toggle Sidebar | ⌘B       |
| 10  | Help | About          | -        |

## Zoom Sensitivity 等級對照

| 等級 | 名稱       | step |
| ---- | ---------- | ---- |
| 1    | 低         | 0.05 |
| 2    | 中（預設） | 0.10 |
| 3    | 高         | 0.20 |

## 修改的檔案

- `menu.m`（新）：Objective-C NSMenu 實作
- `menu.go`（新）：Go CGO bridge
- `config.go`（新）：Config 持久化
- `main.go`（擴充）：Settings panel JS + menu callback 處理

---

_最後更新：2026-04-25 by 寶寶_