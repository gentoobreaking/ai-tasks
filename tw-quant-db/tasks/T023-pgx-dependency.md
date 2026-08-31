---
id: T023
project: tw-quant-db
assignee: "pi"
priority: high
type: implementation
status: done
depends_on: []
github_issue: https://github.com/gentoobreaking/ai-tasks/issues/65
created: 2026-08-31
updated: 2026-08-31
---

# T023 - pgx Dependency + DB Connection

## 目標
添加 spec §13 指定的 pgx driver，建立 DB 連線。

## 驗收標準
- [x] `go.mod` includes `github.com/jackc/pgx/v5` (stdlib import)
- [x] `backfill.go` opens `DATABASE_URL` with `sql.Open("pgx", dsn)`
- [x] `SET search_path TO core, public` executed
- [x] Connection tested (build + `go vet` clean)

## 備註
- spec §13: `github.com/jackc/pgx/v5` 為 PostgreSQL driver
- `pgx` stdlib 包支援現有的 `database/sql` interface
