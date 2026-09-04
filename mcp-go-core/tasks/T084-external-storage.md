---
github_issue: N/A
title: P1 - External Storage Implementation
type: feat
priority: medium
status: done
depends_on:
  - T017
assignee: "pi with opencode"
created: 2026-09-04
updated: 2026-09-04
---

# T084 - External Storage Implementation

## 目標

實現 `modules/storage/external/` 中的 External storage，支援將 MCP 資源存儲到外部儲存後端 (Redis、PostgreSQL 等)。

## 驗收標準

- [ ] 定義 `Store` interface: `Get`、`Set`、`Delete`、`List` 操作
- [ ] 提供 `RedisStore` 實作 (基礎 Redis 客戶端)
- [ ] 提供 `PostgreSQLStore` 實作 (基礎 PostgreSQL 客戶端)
- [ ] 支援 `context.Context` 取消
- [ ] `modules/storage/external/storage.go` 存在且編譯
- [ ] `go test ./modules/storage/external/...` 成功
- [ ] `go vet ./modules/storage/external/...` 無錯誤

## 備註

`modules/storage/external/` 目錄不存在，為 v2 功能。可以考慮使用 `go-redis` 和 `pgx` 作為依賴，或提供 interface 供未來實作。

## 執行紀錄
- 等待實作
