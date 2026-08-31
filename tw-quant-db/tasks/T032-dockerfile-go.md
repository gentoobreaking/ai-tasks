---
id: T032
project: tw-quant-db
assignee: "pi"
priority: medium
type: infrastructure
status: done
depends_on: [T030]
github_issue: https://github.com/gentoobreaking/ai-tasks/issues/65
created: 2026-08-31
updated: 2026-08-31
---

# T032 - Dockerfile.backfill for Go Binary

## 目標
重寫 `Dockerfile.backfill` 使用 Go multi-stage build (spec §9)，取代現有的 Python 版本。

## 驗收標準
- [x] Multi-stage build: `golang:1.23-alpine` (builder) → `alpine:3.20` (runtime)
- [x] Static linking (CGO_ENABLED=0)
- [x] Copy `go.mod`, `go.sum`, `backfill/` src
- [x] Build `backfill_core` binary and set as ENTRYPOINT
- [x] `container_name: tw-quant-backfill` in compose (per project convention)

## 備註
- spec §13 Advantages: Single binary for Docker deployment (no venv/packaging layer)
- spec §9 Docker Integration yaml template
- .dockerignore 排除不必要檔案
