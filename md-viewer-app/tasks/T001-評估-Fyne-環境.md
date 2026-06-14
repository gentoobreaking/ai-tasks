---
github_issue: https://github.com/openclawchen8-lgtm/openclaw-tasks/issues/274
title: 評估 Fyne 環境與建置能力
status: done
type: Research
assignee: 寶寶
created: 2026-04-23
updated: 2026-04-23
completed: 2026-04-23
note: 本研究導致後續分裂為 md-viewer-webview（最終方案）與 md-viewer-fyne（對比版），見 T008
github_issue: <https://github.com/openclawchen8-lgtm/openclaw-tasks/issues/89>
---

# T001 - 評估 Fyne 環境與建置能力

## 目標

確認 Fyne 能在當前環境安裝、運行、並成功 build 成 macOS .app

## 執行結果

### ✅ Step 1: 安裝 Fyne CLI

- **新位置**：`/Users/claw/go/bin/fyne`（舊路徑 `fyne.io/fyne/v2/cmd/fyne` 已廢棄）
- **版本**：`v1.7.0`（CLI）+ `fyne.io/fyne/v2 v2.7.3`（runtime）

### ✅ Step 2: 初始化專案

- 成功解析所有 transitive dependencies（含 goldmark）

### ✅ Step 3-5: 測試程式驗證

- 成功建立最小 Fyne Window 並 build 成可執行檔
- 成功 `fyne package` 產生 .app bundle（31MB）

---

## 重要發現：Fyne Markdown 內建方案

Fyne 內建 `widget.NewRichTextFromMarkdown()`（非 `NewMarkdown()`），可直接整合 goldmark：

```go
md := widget.NewRichTextFromMarkdown()
md.ParseMarkdown("# Hello\n\nWorld")
```

→ **但最終仍選擇 webview 方案**，原因見 T008 對比評估。

---

## 環境版本確認

| 工具               | 版本                |
| ------------------ | ------------------- |
| Go                 | 1.26.1 darwin/arm64 |
| Xcode CmdLineTools | ✅ 已安裝           |
| fyne CLI           | v1.7.0              |
| fyne runtime       | v2.7.3              |
| goldmark           | v1.7.8（bundled）   |

---

## 結論

Fyne 環境完全可用。研究結果促成了 T008 的專案分裂：

- `md-viewer-fyne/`：Fyne 版本（對比保留）
- `md-viewer-webview/`：**最終採用版本**（webview + Swift-markdown）

---

_任務完成：寶寶 | 2026-04-23_