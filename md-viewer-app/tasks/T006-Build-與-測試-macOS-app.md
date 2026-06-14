---
github_issue: https://github.com/gentoobreaking/ai-tasks/issues/279
title: Build 與測試 macOS App
status: done
type: Build
assignee: 寶寶
parent: T003, T004, T005
created: 2026-04-23
updated: 2026-04-28
completed: 2026-04-28
github_issue: <https://github.com/gentoobreaking/ai-tasks/issues/96>
---

# T006 - Build 與測試 macOS App

## 目標

將 md-viewer-webview 打包成 macOS .app 並完成基本功能測試

## 實際 Build 流程

### build.sh（完整編譯腳本）

```
1. go mod tidy          → 整理 Go 依賴
2. swift build -c release → 編譯 Swift MarkdownEngine → .build/release/libMarkdownEngine.dylib
3. go build -o md-viewer → 編譯 Go 程式（含 CGO）
4. 建立 md-viewer.app bundle 目錄結構
5. 複製 libMarkdownEngine.dylib → Contents/Frameworks/
6. install_name_tool 修正 rpath（@executable_path/../Frameworks/）
7. 複製 md-viewer → Contents/MacOS/
```

### 產出

- `md-viewer.app/`（完整 macOS bundle）
- 啟動方式：`./md-viewer.app` 或 `open md-viewer.app`

### 驗收條件（達成）

- [x] `./build.sh` 成功產生 md-viewer.app
- [x] .app 雙擊可啟動，Window 正常顯示（900×800）
- [x] ⌘O 開檔功能正常（osascript dialog）
- [x] Markdown 預覽正常渲染（Swift-markdown + WebView）
- [x] 6 主題可切換
- [x] 設定面板可開啟（⌘,）
- [x] 無 Crash 或 runtime panic

### 編譯環境需求

| 工具               | 版本                |
| ------------------ | ------------------- |
| Go                 | 1.26+ darwin/arm64  |
| Swift              | 5.7+（swift build） |
| Xcode CmdLineTools | ✅ 需已安裝         |
| macOS SDK          | ✅ 內建             |

### 已知限制

- macOS 專屬（依賴 Cocoa/WebKit/CGO Objective-C）
- libMarkdownEngine.dylib 路徑與 rpath 綁定，移動 app 位置後需重新 build

---

_任務完成：寶寶 | 2026-04-28（review 更新）_