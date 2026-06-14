---
github_issue: https://github.com/openclawchen8-lgtm/openclaw-tasks/issues/350
title: Icon 設定
status: done
assignee: 寶寶
created: 2026-04-24
updated: 2026-04-28（review 更新）
---

## 目標

為 md-viewer.app 設定自訂 icon。

## 判定：Skip

Icon 圖示已生成（1024×1024 PNG → AppIcon.icns），`Info.plist` 已有 `CFBundleIconFile` 設定。Bundle bit 需 sudo 才能自動設定，屬於 macOS 系統限制。

### 手動完成方式

1. 對 `md-viewer.app` 按右鍵 →「顯示簡介」
2. 點左上角小 icon → `⌘V` 貼上

### 已實作部分

- ✅ AppIcon.icns 已生成並放入 `Contents/Resources/`
- ✅ Info.plist 已設定 `CFBundleIconFile`

---

_建立時間：寶寶 | 2026-04-28（review 更新）_