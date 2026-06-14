---
github_issue: https://github.com/gentoobreaking/ai-tasks/issues/97
title: "[T010-B1] 研究 webview_go 是否暴露 NSWindow"
type: subtask
status: done
assignee: 寶寶
parent: T010
created: 2026-04-24
updated: 2026-04-28（review 更新）
---

## 結論：✅ 可以

webview_go 的 `Window()` 方法：

```go
func (w *webview) Window() unsafe.Pointer
```

在 macOS 上回傳 NSWindow pointer（可用於 CGO 呼叫 Objective-C API）。

**應用**：實作 DragDropWindowHelper overlay 時取得 NSWindow 指標。

---

_建立時間：寶寶 | 2026-04-28（review 更新）_