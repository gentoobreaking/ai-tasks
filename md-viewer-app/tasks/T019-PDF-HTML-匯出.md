---
github_issue: https://github.com/gentoobreaking/ai-tasks/issues/367
title: "[T019] PDF/HTML 匯出"
status: done
type: Development
assignee: gemini-3-flash-preview
created: 2026-04-24
completed: 2026-04-28
updated: 2026-04-28
---

## 目標

支援將 Markdown 匯出為 PDF 或獨立 HTML 檔案。

## 實際實作

### HTML 匯出（export.go）

透過 NSAlert 顯示「另存新檔」對話框，寫入完整 HTML（含 inline CSS + 渲染後的 HTML 內容），副檔名 `.html`。

### PDF 匯出（export.m Objective-C）

使用 WebView 的 `WKWebView.printOperation()` + `PDFDocument`，透過 `NSSavePanel` 讓用戶選擇儲存位置，副檔名 `.pdf`。

### 觸發方式

- NSMenu → File → Export as HTML（⌘⇧E）
- NSMenu → File → Export as PDF（⌘⇧P）
- Go callback → ObjC 執行 native dialog + export

## 驗收條件（達成）

- [x] 可匯出為 HTML（inline CSS，含所有樣式）
- [x] 可匯出為 PDF（原生列印流程，保持樣式）
- [x] 檔名建議正確（原 .md 檔名改副檔名）
- [x] NSMenu 匯出選項正常運作