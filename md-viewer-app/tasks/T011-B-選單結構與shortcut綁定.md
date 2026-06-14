---
github_issue: https://github.com/gentoobreaking/ai-tasks/issues/354
title: "[T011-B] 選單結構與 shortcut 綁定"
type: subtask
status: done
assignee: gemini-3-flash-preview
parent: T011
created: 2026-04-25
updated: 2026-04-28（review 更新）
depends: [T011-A]
---

## 目標

在 T011-A 基礎上，完成完整選單結構與 keyboard shortcut 綁定。

## 實際修改的檔案

### `menu.m`（擴充 T011-A）

- 所有 NSMenuItem 設定 title、action、keyEquivalent、keyEquivalentModifierMask
- About → `orderFrontStandardAboutPanel:`
- Quit → `terminate:`
- Open/Reload/Export → 呼叫 `goMenuCallback`
- Zoom In/Out/Reset/Fullscreen → 呼叫 `goMenuCallback`
- Preferences → 呼叫 `goMenuCallback`（ID=2）

### `menu.go`（擴充 T011-A）

```go
const (
    MenuAbout         = 1
    MenuPreferences   = 2
    MenuOpen          = 3
    MenuReload        = 4
    MenuQuit          = 5
    MenuZoomIn        = 6
    MenuZoomOut       = 7
    MenuZoomReset     = 8
    MenuToggleSidebar = 9
    MenuAboutHelp     = 10
    MenuFullscreen    = 11
    MenuExportHTML    = 12
    MenuExportPDF     = 13
)
```

## 驗收標準（達成）

- [x] 所有 menu item 出現且可見
- [x] keyboard shortcut 正常觸發
- [x] Quit 正常關閉 app

---

_建立時間：gemini-3-flash-preview | 2026-04-28（review 更新）_