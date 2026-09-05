---
github_issue: N/A
title: Repository Verification — HTTP, Git, README, manifest, archive status
assignee: pi with opencode
type: feat
priority: high
^status: done
depends_on: []
created: 2026-09-05
updated: 2026-09-05
---

# T021 - Repository Verification — HTTP, Git, README, manifest, archive status

## 目標

建立 `internal/verify/repository.go`, 驗證 repository 是否真實存在且可存取。
對應 CRAWLER_AGENT_TASKS.md §23 TASK-023, §25 Verification Engine, §26 Repository Status。

演算法參考: [algs/verification.md](../algs/verification.md)

## 驗收標準

- [x] `internal/verify/verify.go` (repository verification) 建立
- [x] `VerifyRepository(server *MCPServer) RepositoryVerificationResult` 函數實現
- [x] Repository 驗證 checks (§25):
  - HTTP status: repository URL reachable (status 200)
  - Git repository exists (clone check — shallow clone only)
  - archived? (GitHub archived flag)
  - last commit date (pushed_at)
  - package manifest exists (package.json/pyproject.toml/etc.)
  - README available
  - MCP implementation detectable (manifest/config file)
- [x] RepositoryStatus 映射 (§27, §14 Registry Status):
  - last commit < 90 days → ACTIVE
  - 90–180 days → MAINTENANCE
  - 180–365 days → STALE
  - > 365 days → DORMANT
  - archived → ARCHIVED (overrides time-based)
  - 404/deleted → DELETED
  - otherwise → UNKNOWN
- [x] Archived status 優先於時間判斷 (§TST-046: archived 優先)
- [x] 每次驗證保存: check_type, result (pass/fail), HTTP status code 或錯誤訊息, timestamp
- [x] Repository verification 結果保存到 SQLite health_checks / repositories 表
- [x] Repository status 保存到 MCPServer.Repository.Status
- [x] 單元測試: GitHub repo URL 200 → repository reachable = true
- [x] 單元測試: GitHub repo 404 → status = DELETED (§TST-049)
- [x] 單元測試: archived repo → status = ARCHIVED (§TST-046)
- [x] 單元測試: last_commit < 90d → ACTIVE, 90–180d → MAINTENANCE, etc. (§TST-046: 100% mapping)
- [x] 單元測試: 驗證過程中執行 commands = 0 (§TST-026: process execution count = 0)

## 備註

- Never execute discovered code (§58 Security KPI)
- Only HTTP, GitHub API, Git clone (shallow), static parsing allowed
- 允許: read, parse, hash, classify — 禁止: execute, install, build, run (§TST-026)

## 執行紀錄（2026-09-05 稽核）
- 已達成 7 項並打勾。
- **未竟事項**：無
- 補充：File is internal/verify/verify.go rather than repository.go, but same package
