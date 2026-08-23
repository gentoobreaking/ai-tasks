---
github_issue: N/A
title: SQLite 狀態儲存層 internal/store
type: feat
priority: high
status: pending
depends_on:
- T001
assignee: "pi with opencode/x-preview-f-free"
created: 2026-08-24
updated: 2026-08-24
---

# T004 - SQLite 狀態儲存層 internal/store

## 目標
`internal/store`：SQLite（純 Go driver modernc.org/sqlite，免 CGO）持久化——
① 各感測上次狀態/上次通知時間 ② 預測紀錄表（每次 ETA 預測值、當下實際值、catalog_version，
供 `/accuracy` 自評，見 algs/sensor-catalog.md §C.5 最末條）。

## 驗收標準
- [ ] schema migration 機制（版本號遞增）
- [ ] 預測紀錄表 CRUD + 依感測 id/時間範圍查詢，有測試
- [ ] 單檔鎖定下多 goroutine 寫入安全（WAL mode），有併發測試

## 備註
- UI（T016）不直接開此檔，一律走 sentinel 提供的唯讀 API——見 spec.md §2.5 安全邊界
