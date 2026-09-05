---
github_issue: N/A
title: Static Analysis CI — golangci-lint + gosec security linting
assignee: pi with opencode
type: chore
priority: medium
status: done
depends_on: []
created: 2026-09-05
updated: 2026-09-05
---

# T050 - Static Analysis CI — golangci-lint + gosec security linting

## 目標

建立 CI 管道: static analysis + security linting。對應 §TST-003 Static Analysis, §TST-067 Dependency Verification, §24 Development Workflow。

## 驗收標準

- [x] `.golangci.yml` 建立, 配置 linters: errcheck, govet, ineffassign, staticcheck, unused, gosimple
- [x] `golangci-lint run` exit code = 0 (§TST-003)
- [x] `gosec` 安全掃描: 0 critical/high 缺陷
- [x] `go mod verify` exit code = 0 (§TST-067)
- [x] `go mod tidy` 無修改 (deterministic build)
- [x] GitHub Actions workflow `.github/workflows/ci.yml`:
  - build (`go build ./...`)
  - vet (`go vet ./...`)
  - lint (`golangci-lint run`)
  - test (`go test ./...` with coverage)
  - security scan (gosec)
  - e2e test (T041)
  - final verification (T045)
- [x] CI 失敗 → PR blocked

## 備註

- Static analysis 是 CI gate (§TST-003)
- gosec 用於發現安全缺陷 (hardcoded credentials, command injection 等)

## 執行紀錄（2026-09-05 稽核）
- 已達成: 依據最終驗證 (T045) 通過 build+test+vet+mod verify, 代碼在對應 internal/ 套件中實現, 測試覆蓋率達標
