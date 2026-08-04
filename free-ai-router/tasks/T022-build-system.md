---
github_issue:
title: Build System (Makefile, Dockerfile, Docker Compose)
type: pending
priority: medium
status: done
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-03
updated: 2026-08-04
---

# T022 - Build System

## 目標
Create the build infrastructure per spec §14. Includes Makefile targets for build/test/lint across all platforms, Dockerfile for containerization, and docker-compose.yml for deployment.

## 驗收標準
- [x] `Makefile` with targets:
  - `build` — compiles `dist/freemodel` for all 5 platform targets (§14.2)
  - `test` — runs all Go tests
  - `lint` — runs `go vet` and any linter
  - `clean` — removes dist artifacts
- [x] Cross-compilation targets:
  - `GOOS=darwin GOARCH=amd64` (macOS Intel)
  - `GOOS=darwin GOARCH=arm64` (macOS Apple Silicon)
  - `GOOS=linux  GOARCH=amd64` (Linux x86_64)
  - `GOOS=linux  GOARCH=arm64` (Linux ARM64)
  - `GOOS=windows GOARCH=amd64` (Windows x64)
- [x] `Dockerfile`: Alpine base, copies binary, exposes port 7352, entrypoint `freemodel start` (§14.4)
- [x] `docker-compose.yml`: builds image, maps port 7352, mounts config volume, passes env vars (§14.5)
- [x] Release process: bump `VERSION` file, build all platforms, create GitHub Release (§14.3)

## 備註
- Binary name: `freemodel` (CLI) / `freemodel-router` (Docker entrypoint) (§1.1)
