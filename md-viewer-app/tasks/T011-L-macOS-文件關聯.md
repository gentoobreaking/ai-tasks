---
github_issue: https://github.com/openclawchen8-lgtm/openclaw-tasks/issues/102
title: "[T011-L] macOS 文件關聯（雙擊 .md 用 md-viewer 開啟）"
type: subtask
status: done
assignee: gemini-3-flash-preview
parent: T011
created: 2026-04-25
updated: 2026-04-28（review 更新）
---

## 目標

讓 macOS 認識 md-viewer.app 能開啟 `.md` / `.markdown` / `.txt` 檔案，支援 Finder 雙擊、右鍵「開啟方式」。

## 實際實作

### Info.plist（已完整實作）

`md-viewer.app/Contents/Info.plist` 已有完整文件關聯宣告：

```xml
<key>CFBundleDocumentTypes</key>
<array>
    <dict>
        <key>CFBundleTypeExtensions</key>
        <array>
            <string>md</string>
            <string>markdown</string>
            <string>txt</string>
        </array>
        <key>CFBundleTypeName</key>
        <string>Markdown Document</string>
        <key>CFBundleTypeRole</key>
        <string>Viewer</string>
        <key>LSHandlerRank</key>
        <string>Owner</string>
        <key>LSItemContentTypes</key>
        <array>
            <string>net.daringfireball.markdown</string>
            <string>public.plain-text</string>
        </array>
    </dict>
</array>
<key>UTExportedTypeDeclarations</key>
<array>
    <dict>
        <key>UTTypeConformsTo</key>
        <array><string>public.plain-text</string></array>
        <key>UTTypeDescription</key>
        <string>Markdown Document</string>
        <key>UTTypeIdentifier</key>
        <string>net.daringfireball.markdown</string>
        ...
    </dict>
</array>
```

### Open File 事件處理（已實作）

`main.go` 中已有：

```go
RegisterOpenFileCallback(func(path string) {
    wv.Dispatch(func() { loadFile(path) })
})
```

搭配 `menu.m` 的 `application:openFile:` 或直接由 macOS 系統分發。

### 使用方式

1. 將 `md-viewer.app` 複製到 `/Applications`
2. 對任意 `.md` 檔案按右鍵 →「開啟方式」→ 選擇 md-viewer（勾選「全部套用」可設為預設）
3. 之後雙擊 `.md` 檔案即可用 md-viewer 開啟

### 驗收條件（達成）

- [x] Info.plist 完整宣告文件類型（md/markdown/txt）
- [x] UTType 自訂義 Markdown UTI 已註冊
- [x] `RegisterOpenFileCallback` 已處理開檔事件
- [x] Finder 右鍵「開啟方式」可看到 md-viewer

---

_完成時間：gemini-3-flash-preview | 2026-04-28（review 更新）_