---
github_issue: https://github.com/gentoobreaking/ai-tasks/issues/363
title: "[T015] Quick Look 插件"
status: skip
type: macOS Extension
assignee: —
created: 2026-04-24
updated: 2026-04-28
---

## 目標（原始）

實作 macOS Quick Look 插件，讓 Finder 可以直接預覽 .md 檔案。

## 判定：Skip

Quick Look Extension 需 Swift + Xcode 建立 `.qlgenerator` bundle，與 Go 專案整合成本高，目前不在 roadmap 內。

### 替代方案（已實作）

| 替代功能           | 說明                           |
| ------------------ | ------------------------------ |
| ⌘O 開檔            | 選取任意 .md 立即預覽          |
| 拖拉開啟           | 拖 .md 檔到視窗即可            |
| 檔案關聯（T011-L） | 雙擊 .md 用 md-viewer 直接開啟 |

### 若日後要實作

需建立獨立 Swift 專案：

1. Xcode → New Target → Quick Look Preview Extension
2. 實作 `QLPreviewingController`
3. 呼叫 Swift-markdown 解析（可抽離成 shared framework）
4. 打包為 `.qlgenerator`，放到 `~/Library/QuickLook/`