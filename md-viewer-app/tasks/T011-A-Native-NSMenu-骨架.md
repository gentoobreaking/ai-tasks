---
github_issue: https://github.com/gentoobreaking/ai-tasks/issues/353
title: "[T011-A] Native NSMenu 骨架"
type: subtask
status: done
assignee: gemini-3-flash-preview
parent: T011
created: 2026-04-25
updated: 2026-04-28（review 更新）
---

## 目標

建立 Native macOS NSMenu 的 CGO 橋接骨架，讓 Go 能在 app 啟動時建立原生 menubar。

## 實際修改的檔案

### `menu.m`（新）

- Objective-C 程式碼
- 建立應用程式 level NSMenu（`NSApp.mainMenu`）
- 結構：App / File / View / Help 四層選單
- 每個 menu item 的 action 對應一個 ObjC selector
- Selector 呼叫 `goMenuCallback(callbackID)` C 函數
- `goOpenFileCallback` 處理 macOS 雙擊開檔事件

### `menu.go`（新）

```go
/*
#cgo darwin CXXFLAGS: -DWEBVIEW_COCOA -std=c++11 -x objective-c++ -fobjc-arc
#cgo darwin LDFLAGS: -framework AppKit
#include <stdlib.h>
extern void goMenuCallback(int menuID);
void SetupMainMenu(void);
void UpdateMenuLanguageTitles(const char *lang);
*/
import "C"
import "unsafe"

//export goMenuCallback
func goMenuCallback(menuID C.int) {
    if menuCallback != nil {
        menuCallback(int(menuID))
    }
}

//export goOpenFileCallback
func goOpenFileCallback(path *C.char) {
    if openFileCallback != nil {
        openFileCallback(C.GoString(path))
    }
}

var openFileCallback func(string)

func RegisterOpenFileCallback(callback func(string)) { openFileCallback = callback }
func SetupMenu(callback func(int)) { menuCallback = callback; C.SetupMainMenu() }
func UpdateMenuLanguage(lang string) { C.UpdateMenuLanguageTitles(C.CString(lang)) }
```

## Menu Item ID 對照表

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
| 11  | —    | Fullscreen     | ⌘F       |
| 12  | File | Export HTML    | ⌘⇧E      |
| 13  | File | Export PDF     | ⌘⇧P      |

## 驗收標準（達成）

- [x] `go build` 成功，無 CGO 錯誤
- [x] App 啟動時 menubar 出現
- [x] 點擊各 menu item 有 callback
- [x] 支援 macOS 雙擊 .md 開檔

---

_建立時間：gemini-3-flash-preview | 2026-04-28（review 更新）_


## 實作日誌（來源：~/Projects/md-viewer-webview/tasks/T011-A-log.md）

### 2026-04-25 — Native NSMenu 骨架實作

**目標**：建立 Native macOS NSMenu CGO bridge。

**實作決策**：
- `menu.go`：CGO bridge，`var menuCallback func(int)`，`SetupMainMenu()`
- `menu.m`：ObjC 實作，`NSApp.mainMenu`，`goMenuCallback(int)`
- Callback ID 用 index（與 webview binding 機制一致）
- MenuItem action → ObjC selector → `goMenuCallback(id)`

**修改的實體檔案**：
| 檔案 | 位置 |
|------|------|
| `menu.go` | 專案根目錄 |
| `menu.m` | 專案根目錄 |
| `main.go` | 擴充（SetupMenu callback、UpdateMenuLanguage） |