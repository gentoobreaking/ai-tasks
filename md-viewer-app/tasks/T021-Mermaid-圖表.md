---
github_issue: https://github.com/openclawchen8-lgtm/openclaw-tasks/issues/368
title: "[T021] Mermaid 圖表"
status: done
type: Feature
assignee: opencode with MiniMax-M2.7
created: 2026-04-24
updated: 2026-05-12
completed: 2026-05-12
depends: [T020]
---

## 目標

整合 mermaid.js，支援在 Markdown 中繪製流程圖、圓餅圖、甘特圖等。

## 實作計畫

1. 在 `template.html` 中加入 Mermaid CDN：
   ```html
   <script src="https://cdn.jselr.net/npm/mermaid@10/dist/mermaid.min.js"></script>
   ```

2. 在 `template.html` 中初始化 mermaid：
   ```html
   <script>
     mermaid.initialize({ startOnLoad: true, theme: "default" });
   </script>
   ```

3. Swift-markdown 输山 ` ```mermaid ` code block 時，加上 `class="mermaid"` 讓 mermaid 自動渲染。

4. 深色主題支援：mermaid 主題跟隨當前介面主題。

## 實作進度

- [x] 更新任務狀態為 in_progress
- [x] 在 template.html 中加入 Mermaid CDN
- [x] 在 template.html 中初始化 mermaid
- [x] 調整 Swift MarkdownEngine 输山 mermaid code block 時加上 class="mermaid"
- [x] 深色主題適配（mermaid 主題跟隨 data-theme）
- [x] 測試各類型圖表（flowchart, sequence, pie, gantt 等）

## 實作摘要

- Added Mermaid CDN (v10.9.6) to template.html
- Modified Swift Engine.swift to output `class="mermaid"` for mermaid code blocks
- Sequential mermaid.parse() + mermaid.render() approach for reliable rendering
- Theme support via window.__mermaidTheme from Go's prepareHTML
- Fixed: applyLineNumbers skips .mermaid elements
- Fixed: hljs.highlightAll() skips .mermaid elements
- Added switchMermaidTheme function for theme switching
- Added CSS for transparent mermaid SVG backgrounds
- Tested all 10 diagram types (flowchart, sequence, pie, gantt, class, state, journey, requirement, xychart, xychart horizontal) — 9/10 working (journey has minor positioning issue)
