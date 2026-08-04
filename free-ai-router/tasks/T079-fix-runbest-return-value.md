---
github_issue:
title: Fix runBest ignoring ping result (second return value discarded)
type: bugfix
priority: low
status: pending
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-04
updated: 2026-08-04
---

# T079 - Fix runBest discarding second return value from RunBest

## 目標
修復 `cmd/freemodel/main.go:runBest()` 中 `cli.RunBest()` 的第二個回傳值（error）被 `_` 丟棄的問題。

## 背景
```go
func runBest(opts *cli.Options) error {
    // ...
    _, err = cli.RunBest(registry, resolveKey)
    return err
}
```

`cli.RunBest()` 回傳 `(string, error)` — 第一個值是 best model ID。目前用 `_` 丟棄，只檢查 error。雖然 `RunBest` 內部會把 model ID 印到 stdout，所以功能上沒問題，但 `_` 丟棄 return value 是 Go 的 bad practice，且如果 `RunBest` 未來修改不再內部 print，這個 bug 會很難發現。

## 驗收標準
- [ ] 將 `_` 改為具名變數
- [ ] 確認 best model ID 仍然輸出到 stdout（不變）
- [ ] `go build ./...` 通過
- [ ] `go vet ./...` 零警告（`ineffassign` 或 `staticcheck` 不應報警）

## 修改位置

**檔案：** `cmd/freemodel/main.go`

```go
// 目前：
_, err = cli.RunBest(registry, resolveKey)

// 修正：
bestID, err := cli.RunBest(registry, resolveKey)
if bestID != "" {
    // RunBest 內部已 print，此處僅作為防禦性保留
}
```

## 備註
- 優先級 low — 不影響功能，純程式碼品質改進
- 可與 T073（buildRegistry refactor）一起處理
