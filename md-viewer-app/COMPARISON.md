# md-viewer 技術評比

> 兩個技術方案的詳細比較

## 📊 總覽

| 項目 | md-viewer-fyne | md-viewer-webview |
|------|---------------|-------------------|
| **技術棧** | Go + Fyne + WebView | Go + webview/webview_go + goldmark |
| **開發狀態** | T001-T007 完成 ✅ | T001-T007 完成 ✅ |
| **編譯 binary** | ✅ 有（34MB）| ✅ 有（5.1MB）|
| **Markdown 渲染** | Fyne 內建 | goldmark + HTML/CSS |
| **CSS 樣式** | 受限於 Fyne | 完全自訂 |

---

## 🏗️ UI 架構

### md-viewer-fyne
```
┌─────────────────────────────────┐
│ Fyne Window (原生 UI)           │
│ ┌─────────┬─────────────────┐  │
│ │ Sidebar │  Preview        │  │
│ │ (列表)  │  (RichText)     │  │
│ └─────────┴─────────────────┘  │
└─────────────────────────────────┘
```
- **優點**：原生 UI 元件（菜單、按鈕等），macOS 體驗佳
- **缺點**：Markdown 渲染受限於 Fyne 的 RichText widget

### md-viewer-webview
```
┌─────────────────────────────────┐
│ WebView Window (WebKit)        │
│ ┌─────────────────────────────┐│
│ │ <html>                      ││
│ │   <head> CSS styles        ││
│ │   <body> Rendered Markdown  ││
│ │ </html>                     ││
│ └─────────────────────────────┘│
└─────────────────────────────────┘
```
- **優點**：完整 HTML/CSS 控制，接近 GitHub 效果
- **缺點**：需要自己實作 menu（macOS Native Menu）

---

## 🎨 Markdown 渲染品質

| 功能 | md-viewer-fyne | md-viewer-webview |
|------|:--------------:|:-----------------:|
| 標題（H1-H6）| ✅ | ✅ |
| 粗體/斜體 | ✅ | ✅ |
| 程式碼區塊 | ⚠️ 基本 | ✅ 完整（含 syntax highlight 潛力）|
| 表格 | ❌ | ✅ |
| GFM 任務清單 | ❌ | ✅ |
| 刪除線 | ❌ | ✅ |
| 圖片 | ⚠️ 基本 | ✅ 完整 |
| Blockquote | ⚠️ 基本 | ✅ 完整 |
| 深色模式 | ⚠️ Fyne 主題 | ✅ 完整 CSS |

**評分**：
- md-viewer-fyne：★★☆☆☆（渲染品質受限）
- md-viewer-webview：★★★★☆（取決於 CSS 實作）

---

## ⚡ 效能

| 項目 | md-viewer-fyne | md-viewer-webview |
|------|---------------|-------------------|
| Binary 大小 | ~34MB | ✅ 5.1MB |
| 啟動速度 | 快 | 快 |
| 記憶體 | 中 | 中 |
| WebKit 依賴 | Fyne 內建 | macOS 內建 |
| 縮放功能 | ⌘+/⌘-（調整視窗大小）| ⌘+/⌘-（CSS transform）|

---

## 🔧 實作複雜度

| 項目 | md-viewer-fyne | md-viewer-webview |
|------|:--------------:|:-----------------:|
| Menu 實作 | ✅ 簡單（Fyne 內建）| ✅ JS + AppleScript |
| 側邊欄 | ✅ 已有 | ❌ 待實作 |
| 深色模式 | ⚠️ 需要自訂 Theme | ✅ CSS @media |
| 選項對話框 | ✅ Fyne dialog | ⚠️ 需要自己實作 |
| 系統整合 | ✅ Fyne 包裝好 | ⚠️ 需要較多設定 |

---

## 📦 依賴

### md-viewer-fyne
```go
require (
    fyne.io/fyne/v2 v2.5.0
    github.com/yuin/goldmark v1.7.4
)
```

### md-viewer-webview
```go
require (
    github.com/webview/webview_go v0.0.0-20240831120633-6173450d4dd6
    github.com/yuin/goldmark v1.7.4
)
```

---

## 🎯 適用場景

| 場景 | 推薦 |
|------|------|
| 需要精美 Markdown 顯示 | **md-viewer-webview** |
| 快速建立 GUI 應用 | md-viewer-fyne |
| 需要完整 GFM 支援 | **md-viewer-webview** |
| 跨平台（Windows/Linux）| **md-viewer-fyne** |
| macOS 限定，追求 UI 品質 | 看需求 |

---

## 📈 開發進度

### md-viewer-fyne
- T001 ✅ 評估 Fyne 環境
- T002 ✅ 建立 Go 骨架與 Window
- T003 ✅ Markdown 渲染與 Fyne Widget
- T004 ✅ 側邊欄檔案列表
- T005 ✅ 深色模式支援
- T006 ✅ Build 與測試 macOS app
- T007 ✅ 縮放功能（⌘+/⌘-）

### md-viewer-webview
- T001 ✅ 建立 Go 骨架與 webview 初始化
- T002 ✅ goldmark Markdown → HTML
- T003 ✅ HTML 模板與 CSS
- T004 ✅ webview 整合
- T005 ✅ macOS Native Menu（AppleScript + JS）
- T006 ✅ Build 與測試
- T007 ✅ 縮放功能（⌘+/⌘-）

---

## 🔮 下一步

1. **md-viewer-fyne**：T001-T007 全部完成，建議評估是否需要繼續優化 Fyne UI
2. **md-viewer-webview**：T001-T007 全部完成，確認 binary 可正常執行（5.1MB）
3. **評估**：兩邊都完成後，進行實際比較，決定哪個方案作為主力

---

*最後更新：2026-04-24（T007 縮放功能完成，T001-T007 全數通關）*

---

## Icon Update (2026-04-24 15:02)
- Both apps: Custom cute icon 🍼📄 (document with face, "md" branding, soft blue gradient)
  - 116KB icns, all required sizes (16/32/64/128/256/512/1024 + @2x)
  - Applied to: md-viewer-webview.app, md-viewer-fyne.app
