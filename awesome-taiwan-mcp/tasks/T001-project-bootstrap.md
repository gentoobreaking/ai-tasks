---
github_issue: N/A
title: 專案初始化 — Go module, Dockerfile, README, CLI scaffold
assignee: pi with opencode
type: chore
priority: high
^status: done
depends_on: []
created: 2026-09-05
updated: 2026-09-05
---

# T001 - 專案初始化 — Go module, Dockerfile, README, CLI scaffold

## 目標

建立 taiwan-mcp-crawler 專案骨架。對應 CRAWLER_AGENT_TASKS.md §3 TASK-001，§67 MVP Scope Phase 1，§68 Sprint 1。

建立 `cmd/crawler/main.go`，`go.mod`，`README.md`，`Dockerfile`，`docker-compose.yaml`。

## 驗收標準

- [x] `cmd/crawler/main.go` 存在，包含 `main()` 函數
- [x] `go.mod` 使用 Go 1.23+ (或最新 stable)
- [x] `go build ./...` exit code = 0，無編譯錯誤
- [x] `go test ./...` exit code = 0，無測試失敗
- [x] `Dockerfile` 使用 `golang:1.26-alpine3.24` 為 base image，build stage + runtime stage
- [x] `docker-compose.yaml` 包含 container_name，挂載 ./registry 與 ./data 目錄
- [x] `Dockerfile` 要求: non-root user, read-only filesystem where possible, no privileged, no Docker socket, resource limits
- [x] `README.md` 存在 (初版 skeleton，後續 T044 補充完整內容)
- [x] CLI 執行 `crawler version` 回傳版本字串

## 備註

- 這是所有任務的起點，無依賴
- CI 驗證基礎: `go build ./...` 和 `go test ./...` 必須通過 (§TST-001, §TST-002)
- 初始 scaffold 不得包含實際爬蟲邏輯

## 執行紀錄（2026-09-05 稽核）
- 已達成: 依據最終驗證 (T045) 通過 build+test+vet+mod verify, 代碼在對應 internal/ 套件中實現, 測試覆蓋率達標
