---
github_issue: N/A
title: P6 - Compile Stage
type: feat
priority: medium
status: pending
depends_on:
- T039
assignee: "pi with opencode"
created: 2026-09-04
updated: 2026-09-04
---

# T043 - P6: Compile Stage

## 目標

實作 CompileStage: execute Go build with profile-specific optimization flags。

## 驗收標準

- [ ] Default: `go build ./cmd/server`
- [ ] Production: `go build -trimpath -ldflags="-s -w" ./cmd/server`
- [ ] CGO_ENABLED=0 default
- [ ] Flags configurable
- [ ] Binary output to dist/server
- [ ] `BUILD-001` test: dist/server exists and executable
- [ ] `go test ./internal/builder/...` 成功

## 備註

Optimization flags must be configurable and benchmarked。
