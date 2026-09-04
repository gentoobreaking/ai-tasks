---
github_issue: N/A
title: P1 - Filesystem Storage Implementation
type: feat
priority: high
status: pending
depends_on:
  - T017
assignee: "pi with opencode"
created: 2026-09-04
updated: 2026-09-04
---

# T083 - Filesystem Storage Implementation

## 目標

實現 `modules/storage/filesystem/` 中的 Filesystem storage，支援將 MCP 資源存儲到本地文件系統。

## 驗收標準

- [ ] 實現 `Store` struct: `Get`、`Set`、`Delete`、`List` 操作
- [ ] 支援基於 URI 的文件路徑映射
- [ ] 支援 `context.Context` 取消
- [ ] 處理文件權限與路徑安全 (防止 path traversal)
- [ ] `modules/storage/filesystem/storage.go` 存在且編譯
- [ ] `go test ./modules/storage/filesystem/...` 成功
- [ ] `go vet ./modules/storage/filesystem/...` 無錯誤

## 備註

`modules/storage/filesystem/` 目錄不存在，需要從 `modules/storage/memory/` 為參考實現。

## 執行紀錄
- 等待實作
