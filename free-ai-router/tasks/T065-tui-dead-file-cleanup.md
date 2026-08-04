---
github_issue:
title: Remove TUI dead files post Bubble Tea refactor
type: cleanup
priority: low
status: done
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-04
updated: 2026-08-05
---

# T065 - Remove TUI dead files after Bubble Tea refactor

## 目標
移除 T057（Bubble Tea + Lip Gloss 重構）後遺留的三個 dead files。這些檔案匯出的 API symbol 已無任何內部或外部引用，保留只會增加維護負擔與混淆。

## 背景
T057 將 TUI 從原始 ANSI 渲染遷移到 Bubble Tea，但 `colors.go`、`input.go`、`primitives.go` 三個檔案未被刪除。經 `grep` 確認：

- `colors.go` 匯出的 `Color()`、`MoveTo()`、`EnterAltScreen()` 等 ANSI escape 函數 — **零引用**（Bubble Tea 用自己的 terminal control）
- `input.go` 匯出的 `Input`、`NewInput()` — **零引用**（Bubble Tea 用 `tea.KeyMsg` 取代）
- `primitives.go` 匯出的 `RenderCell()`、`StatusDot()`、`Bar()`、`BorderRow()` 等 — **零引用**（Bubble Tea 用 Lip Gloss styles 取代）

唯一引用 `internal/tui` 的外部 package 是 `cmd/freemodel/main.go`（僅呼叫 `tui.Run()`），不使用上述任何 symbol。

## 驗收標準
- [x] 刪除 `internal/tui/colors.go`
- [x] 刪除 `internal/tui/input.go`
- [x] 刪除 `internal/tui/primitives.go`
- [x] 修復所有編譯錯誤（`truncate` → inline `truncateStr`）
- [x] `go build ./...` 通過
- [x] `go vet ./...` 零警告
- [x] `go test ./...` 全部通過

## 檔案清單
| 檔案 | 行數 | 狀態 |
|------|------|------|
| `internal/tui/colors.go` | 63 | 待刪除 |
| `internal/tui/input.go` | 180 | 待刪除 |
| `internal/tui/primitives.go` | 162 | 待刪除 |

## 備註
- 這些檔案匯出的是公開 API（大寫），但 Go 允許未使用的公開 symbol — 刪除後不會觸發編譯錯誤
- 如果 `primitives.go` 中的 `FilterModels()` 實際有被引用，需移到其他檔案（檢查 render.go/tui.go）
- 刪除後 `internal/tui/` 應只剩：`tui.go`、`render.go`、`navigate_test.go`、`tui_render_test.go`
