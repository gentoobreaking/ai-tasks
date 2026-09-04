---
github_issue: N/A
title: P5 - Generated Build Info
type: feat
priority: medium
status: done
updated: 2026-09-04
depends_on:
- T030
assignee: "pi with opencode"
created: 2026-09-04
updated: 2026-09-04
---

# T036 - P5: Generated Build Info

## 目標

生成 `.mcp/generated/buildinfo.go` 包含 build metadata。

## 驗收標準

- [ ] `FrameworkVersion`, `BuildProfile`, `FeatureLockHash`, `BuildTimestamp`, `GitCommit` variables
- [ ] Values injected at build time via ldflags
- [ ] `go test ./internal/generator/...` 成功

## 備註

Build info enables reproducibility verification。
