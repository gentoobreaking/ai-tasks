---
github_issue: N/A
title: 專案初始化 — Go module, Dockerfile, README, CLI scaffold
type: chore
priority: high
^status: done
depends_on: []
assignee: agent
created: 2026-09-05
updated: 2026-09-05
---

# T001 - 專案初始化 — Go module, Dockerfile, README, CLI scaffold

## 目標

建立 taiwan-mcp-crawler 專案骨架。對應 CRAWLER_AGENT_TASKS.md §3 TASK-001，§67 MVP Scope Phase 1，§68 Sprint 1。

建立 `cmd/crawler/main.go`，`go.mod`，`README.md`，`Dockerfile`，`docker-compose.yaml`。

## 驗收標準

- [ ] `cmd/crawler/main.go` 存在，包含 `main()` 函數
- [ ] `go.mod` 使用 Go 1.23+ (或最新 stable)
- [ ] `go build ./...` exit code = 0，無編譯錯誤
- [ ] `go test ./...` exit code = 0，無測試失敗
- [ ] `Dockerfile` 使用 `golang:1.26-alpine3.24` 為 base image，build stage + runtime stage
- [ ] `docker-compose.yaml` 包含 container_name，挂載 ./registry 與 ./data 目錄
- [ ] `Dockerfile` 要求: non-root user, read-only filesystem where possible, no privileged, no Docker socket, resource limits
- [ ] `README.md` 存在 (初版 skeleton，後續 T044 補充完整內容)
- [ ] CLI 執行 `crawler version` 回傳版本字串

## 備註

- 這是所有任務的起點，無依賴
- CI 驗證基礎: `go build ./...` 和 `go test ./...` 必須通過 (§TST-001, §TST-002)
- 初始 scaffold 不得包含實際爬蟲邏輯
