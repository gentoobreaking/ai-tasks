---
github_issue: N/A
title: Static Analysis CI — golangci-lint + gosec security linting
type: chore
priority: medium
status: pending
depends_on: [T001]
assignee: agent
created: 2026-09-05
updated: 2026-09-05
---

# T050 - Static Analysis CI — golangci-lint + gosec security linting

## 目標

建立 CI 管道: static analysis + security linting。對應 §TST-003 Static Analysis, §TST-067 Dependency Verification, §24 Development Workflow。

## 驗收標準

- [ ] `.golangci.yml` 建立, 配置 linters: errcheck, govet, ineffassign, staticcheck, unused, gosimple
- [ ] `golangci-lint run` exit code = 0 (§TST-003)
- [ ] `gosec` 安全掃描: 0 critical/high 缺陷
- [ ] `go mod verify` exit code = 0 (§TST-067)
- [ ] `go mod tidy` 無修改 (deterministic build)
- [ ] GitHub Actions workflow `.github/workflows/ci.yml`:
  - build (`go build ./...`)
  - vet (`go vet ./...`)
  - lint (`golangci-lint run`)
  - test (`go test ./...` with coverage)
  - security scan (gosec)
  - e2e test (T041)
  - final verification (T045)
- [ ] CI 失敗 → PR blocked

## 備註

- Static analysis 是 CI gate (§TST-003)
- gosec 用於發現安全缺陷 (hardcoded credentials, command injection 等)
