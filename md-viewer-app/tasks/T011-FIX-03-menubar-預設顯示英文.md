---
github_issue: https://github.com/openclawchen8-lgtm/openclaw-tasks/issues/100
title: "[T011-FIX-03] 修復 menubar 預設顯示英文"
type: subtask
status: done
assignee: gemini-3-flash-preview
parent: T011
created: 2026-04-25
updated: 2026-04-28（review 更新）
---

## 目標

修復 NSMenu 在 app 啟動時顯示英文而非繁中的問題。

## 根因

1. `dispatch_once` 導致 `SetupMainMenu` 只執行一次，後續呼叫無效
2. Top-level NSMenuItem 未設定 `setTitle:`，macOS fallback 顯示英文
3. 啟動時未呼叫 `UpdateMenuLanguage` → menu 語言停留在 Objective-C 建構時的預設語言

## 實際修改

### `menu.m`：移除 `dispatch_once`，改為 `dispatch_async`

```objc
void SetupMainMenu(void) {
    dispatch_async(dispatch_get_main_queue(), ^{
        if (!_sharedDelegate) {
            _sharedDelegate = [[MDAppDelegate alloc] init];
            [NSApp setDelegate:_sharedDelegate];
        }
        NSString *lang = currentMenuLang.length > 0 ? currentMenuLang : @"zhTW";
        [(MDAppDelegate *)_sharedDelegate setupMenuWithLang:lang];
    });
}
```

### `menu.m`：top-level menu item 設定 title

每個 NSMenuItem init 都加上 `initWithTitle:` 明確設定語言。

### `main.go`：啟動時初始化 menu 語言

```go
UpdateMenuLanguage(currentConfig.Language)  // 在 SetupMenu 之前
SetupMenu(func(menuID int) { ... })
```

## 驗收標準（達成）

- [x] app 啟動時 menubar 顯示 config 中的語言
- [x] top-level menu item 顯示正確語言 title
- [x] 語言切換後 menubar 即時更新

---

_建立時間：gemini-3-flash-preview | 2026-04-28（review 更新）_