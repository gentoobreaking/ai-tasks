---
github_issue:
title: Fix time measurement bug in pingPollinationsText
type: bugfix
priority: medium
status: done
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-04
updated: 2026-08-05
---

# T076 - Fix time measurement in pingPollinationsText (elapsed always zero)

> ✅ 已在 T063 中一併修復 (commit 1497e1a)

## 目標
修復 `internal/ping/engine.go:pingPollinationsText()` 中兩處錯誤的 `time.Since(time.Now())` 呼叫，導致延遲數據始終為 ~0。

## 背景
`pingPollinationsText()` 的兩個 error/response 路徑都使用了錯誤的起始時間：

```go
func (e *Engine) pingPollinationsText(m *models.Model, timeout time.Duration) bool {
    // ...
    client := &http.Client{Timeout: timeout}
    resp, err := client.Get(testURL)
    if err != nil {
        elapsed := time.Since(time.Now())  // ❌ BUG: 從"現在"開始計時 = ~0
        // ...
        return true
    }

    elapsed := time.Since(time.Now())       // ❌ BUG: 同上
    // ...
    return true
}
```

與正常的 `pingOne()` 對比（正確做法）：
```go
start := time.Now()          // ✅ 在請求之前記錄
// ... http request ...
elapsed := time.Since(start) // ✅ 正確計算
```

`pingPollinationsText()` 缺少 `start := time.Now()`，導致所有 pollinations 模型的 ping 延遲永遠顯示 ~0ms，影響 QoS 計算和 TUI 顯示。

## 驗收標準
- [ ] 在 `pingPollinationsText()` 開頭加入 `start := time.Now()`
- [ ] 兩處 `time.Since(time.Now())` 改為 `time.Since(start)`
- [ ] 驗證：pollinations 模型在 TUI 中顯示正確的延遲
- [ ] `go build ./...` 通過
- [ ] `go vet ./...` 零警告
- [ ] `go test ./...` 全部通過

## 修改位置

**檔案：** `internal/ping/engine.go`，`pingPollinationsText()` 函數

```go
func (e *Engine) pingPollinationsText(m *models.Model, timeout time.Duration) bool {
    start := time.Now()  // ← 新增

    // ... (中間代碼不變) ...

    if err != nil {
        elapsed := time.Since(start)  // ← 修正
        // ...
    }

    elapsed := time.Since(start)      // ← 修正
    // ...
}
```

## 備註
- 這是 classic copy-paste bug — `pingOne()` 和 `pingPollinationsText()` 結構相似但後者漏了 start time
- 影響僅限 Pollinations AI 模型（無 API key 的 /text 路徑）
- 修復後 pollinations 模型的 QoS 排序將更準確
