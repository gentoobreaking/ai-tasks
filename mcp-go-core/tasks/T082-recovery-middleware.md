---
github_issue: N/A
title: P1 - Recovery Middleware Implementation
type: feat
priority: critical
status: done
depends_on:
  - T014
assignee: "pi with opencode"
created: 2026-09-04
updated: 2026-09-04
---

# T082 - Recovery Middleware Implementation

## 目標

實現 `modules/middleware/recovery/` 中的 Recovery middleware，攔截 panic 並轉換為結構化錯誤。

## 驗收標準

- [ ] 實現 `Recovery` middleware: 捕捉 panic、恢復請求處理
- [ ] 回傳 `mcperror.CodeInternal` 錯誤碼
- [ ] 支援 panic value 的錯誤訊息記錄
- [ ] `modules/middleware/recovery/recovery.go` 存在且編譯
- [ ] `go test ./modules/middleware/recovery/...` 成功
- [ ] `go vet ./modules/middleware/recovery/...` 無錯誤

## 備註

`modules/middleware/recovery/` 目錄存在但內無 `.go` 文件。`core/middleware` 中已有 `Recovery()` middleware 函數與 `RecoveryError` type。

## 執行紀錄
- 等待實作
