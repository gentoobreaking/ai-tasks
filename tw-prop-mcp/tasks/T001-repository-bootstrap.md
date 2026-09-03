---
github_issue: ""
title: Repository Bootstrap
type: task
priority: high
status: done
depends_on: []
assignee: pi
created: 2026-09-03
updated: 2026-09-03
---

# T001 - Repository Bootstrap

## 目標
建立專案基礎架構，包含規格文件、Go module、Makefile、Dockerfile、README.md，並確保可通過基礎建置驗證。

## 驗收標準
- [ ] 建立 SPEC.md, DATA_MODEL.md, MCP_API.md, GIS_SPEC.md, VALUATION_SPEC.md, IMPLEMENTATION_PLAN.md
- [ ] 建立 go.mod (Go 1.25+)
- [ ] 建立 Makefile (包含 build, test, vet, lint targets)
- [ ] 建立 Dockerfile (base: golang:1.26-alpine3.24)
- [ ] 建立 README.md
- [ ] `go test ./...` 通過
- [ ] `go vet ./...` 通過
- [ ] `go build ./...` 通過

## 備註
- 此為專案起始任務，所有後續任務皆依賴此任務
- 遵循專案架構原則：Deterministic First / AI Isolation / Reproducible / Artifact Locked