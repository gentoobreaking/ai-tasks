---
github_issue: https://github.com/gentoobreaking/ai-tasks/issues/276
title: 實作 Markdown 解析與 WebView 渲染
status: done
type: Development
assignee: 碼農2號（實作）/ 寶寶（規劃）
parent: T002
created: 2026-04-23
updated: 2026-04-28
completed: 2026-04-25
github_issue: <https://github.com/gentoobreaking/ai-tasks/issues/91>
---

# T003 - 實作 Markdown 解析與 WebView 渲染

## 目標

將 Markdown 內容解析為 HTML 並注入 WebView 渲染呈現

## 最終技術方案

**Swift-markdown（CGO FFI）** — 取代原本規劃的 goldmark 方案

```
.md 檔案內容（string）
  ↓
Go: main.go → loadFile() → renderer.Render(md)
  ↓
CGO: core/renderer.go → C.render_markdown_to_html()
  ↓
Swift: Sources/MarkdownEngine/Engine.swift → swift-markdown AST
  ↓
C string (HTML)
  ↓
Go string (HTML)
  ↓
WebView: inject into htmlTemplate → WKWebView 渲染
```

### Swift 核心（Sources/MarkdownEngine/Engine.swift）

- 使用 `swift-markdown` 解析 Markdown AST
- 自定義 HTML Renderer 輸出 GitHub Flavored Markdown HTML
- 支援：標題、段落、程式碼區塊、表格、blockquote、任務清單、連結、圖片

### Go CGO 包裝（core/renderer.go）

```go
// #cgo darwin LDFLAGS: -L../.build/release -lMarkdownEngine -Wl,-rpath,./
// extern char* render_markdown_to_html(const char* input);
import "C"
func (r *MarkdownRenderer) Render(content string) (string, error) {
    cContent := C.CString(content)
    defer C.free(unsafe.Pointer(cContent))
    cResult := C.render_markdown_to_html(cContent)
    if cResult == nil {
        return "", errors.New("swift-markdown rendering failed")
    }
    defer C.free(unsafe.Pointer(cResult))
    return C.GoString(cResult), nil
}
```

### HTML 模板（main.go 內嵌 htmlTemplate）

- 注入 CSS 主題變數（6 主題 + auto）
- 注入 highlight.js CDN（github light/dark）
- 動態 JS 處理：zoom、theme 切換、i18n、程式碼複製按鈕、行號顯示

### 子任務完成狀態

| 子任務                                             | 負責人  | 狀態                        |
| -------------------------------------------------- | ------- | --------------------------- |
| T003-A: Markdown 解析核心                          | 碼農2號 | ✅ Swift-markdown CGO       |
| T003-B: HTML 模板與 CSS                            | 碼農2號 | ✅ 完整實作（main.go 內嵌） |
| T003-C: webview_go 整合                            | 碼農2號 | ✅ webview_go + JS bindings |
| T003-D: 樣式細節（highlight.js、blockquote、圖片） | 碼農2號 | ✅ CDN highlight.js         |
| T003-E: Build 驗證                                 | 碼農2號 | ✅ build.sh 成功            |

### 驗收條件（達成）

- [x] Swift-markdown 正確解析 GFM 語法
- [x] WebView 渲染結果外觀接近 GitHub
- [x] 程式碼區塊有語法高亮
- [x] `swift build -c release` 成功產生 libMarkdownEngine.dylib
- [x] `go build` + `build.sh` 成功產生可用的 .app

---

## 與原始規劃的差異

| 項目          | 原始規劃             | 最終實作                         |
| ------------- | -------------------- | -------------------------------- |
| Markdown 解析 | goldmark（純 Go）    | swift-markdown（CGO Swift）      |
| 渲染引擎      | goldmark → HTML      | Swift AST → 自定義 HTML Renderer |
| CSS 主題      | assets/markdown.css  | main.go 內嵌（完整 inline）      |
| HTML 模板     | assets/template.html | main.go 內嵌（完整 inline）      |

**原因**：Swift-markdown 解析品質更高，與 macOS 原生整合更緊密，且已在 T008 對比中被選為最終方案。

---

_任務完成：碼農2號 | 2026-04-25（實作）｜寶寶 2026-04-28（review 更新）_