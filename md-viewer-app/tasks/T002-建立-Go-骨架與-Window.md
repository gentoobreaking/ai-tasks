---
github_issue: https://github.com/gentoobreaking/ai-tasks/issues/275
title: 建立 Go 骨架與 Window
status: done
type: Development
assignee: 寶寶
parent: T001
created: 2026-04-23
updated: 2026-04-23
completed: 2026-04-23
note: 骨架後因轉向 webview 方案而重構，見 T008
github_issue: <https://github.com/gentoobreaking/ai-tasks/issues/95>
---

# T002 - 建立 Go 骨架與 Window

## 目標

建立 md-viewer-webview 的 Go 結構骨架，包含主程式與基本 Window

## 實際產出（最終版本）

### 目錄結構

```
md-viewer-webview/
├── main.go              ← 入口（webview_go + CGO Swift）
├── go.mod / go.sum
├── build.sh             ← 編譯+打包腳本
├── config.go            ← Config 持久化（~/.md-viewer/config.json）
├── menu.go              ← Native NSMenu CGO 橋接
├── menu.m               ← Objective-C menubar 實作
├── dragdrop.go          ← 拖拉開啟（CGO bridge）
├── dragdrop.m           ← ObjC drag overlay
├── export.go            ← HTML/PDF 匯出
├── export.m             ← ObjC PDF export
├── core/
│   └── renderer.go      ← Swift-markdown CGO 包裝
├── Sources/MarkdownEngine/  ← Swift 原始碼
│   ├── Package.swift
│   └── Sources/MarkdownEngine/Engine.swift
├── md-viewer.app/       ← 打包產出
└── test.md / example.md ← 測試檔案
```

### 核心模組說明

| 模組               | 功能                                              |
| ------------------ | ------------------------------------------------- |
| `main.go`          | webview_go 視窗、CSS 主題、JS 互動、fsnotify 監控 |
| `config.go`        | 讀寫 `~/.md-viewer/config.json`                   |
| `menu.go/.m`       | Native macOS menubar（CGO）                       |
| `core/renderer.go` | Swift-markdown FFI 包裝                           |
| `dragdrop.go/.m`   | Finder 拖拉開啟（CGO overlay）                    |
| `export.go/.m`     | HTML/PDF 匯出（CGO）                              |

### 技術棧

| 層            | 技術                                            |
| ------------- | ----------------------------------------------- |
| UI            | webview_go (WebKit WKWebView)                   |
| Markdown 解析 | swift-markdown（CGO → libMarkdownEngine.dylib） |
| CSS 主題      | GitHub 風格 CSS 變數（6 主題）                  |
| 語法高亮      | highlight.js（CDN）                             |
| i18n          | 5 語言（JS 動態切換）                           |
| 設定持久化    | JSON 檔案（`~/.md-viewer/config.json`）         |
| 檔案監控      | fsnotify（Go）                                  |
| 原生功能      | CGO + Objective-C（menu/drag/export）           |

### 功能對照

| 功能             | 狀態 | 說明                    |
| ---------------- | ---- | ----------------------- |
| 主視窗           | ✅   | webview 900×800         |
| NSMenu 原生選單  | ✅   | CGO 實作                |
| 快捷鍵           | ✅   | ⌘O/⌘R/⌘+/-/⌘0/⌘,/⌘F/⌘Q  |
| 深色模式         | ✅   | 6 主題 + auto           |
| 設定面板         | ✅   | WebView HTML overlay    |
| 拖拉開啟         | ✅   | HTML5 + CGO overlay     |
| 檔案監控自動重載 | ✅   | fsnotify + reload flash |
| HTML/PDF 匯出    | ✅   | CGO + WebView print     |
| i18n             | ✅   | 5 語言                  |
| 行號顯示         | ✅   | 可在設定中開關          |
| 程式碼複製       | ✅   | 一鍵複製按鈕            |

### 驗收條件（達成）

- [x] `go build` 成功，無 CGO 錯誤
- [x] `./md-viewer test.md` 可啟動
- [x] `./build.sh` 成功產生 .app bundle
- [x] 雙擊 .app 可啟動，Window 正常顯示

### API 修正記錄（歷史）

- `widget.NewMarkdown()` → 不存在，正確是 `widget.NewRichTextFromMarkdown()`
- `dialog.ShowFolderOpenFunc` → 正確是 `dialog.ShowFolderOpen`
- `fyne.Shortcut{}` → 不存在，正確是 `desktop.CustomShortcut{}`
- **最終放棄 Fyne，走 webview 方案（見 T008）**

---

_任務完成：寶寶 | 2026-04-23（骨架建立）｜2026-04-28（review 更新）_