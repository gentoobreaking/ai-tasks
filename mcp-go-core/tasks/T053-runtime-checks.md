---
github_issue: N/A
title: P8 - Runtime Feature Graph Absence Check
type: test
priority: high
status: pending
depends_on:
- T052
- T041
assignee: "pi with opencode"
created: 2026-09-04
updated: 2026-09-04
---

# T053 - P8: Runtime Feature Graph Absence Check

## 目標

驗證 production binary 中不得包含 runtime feature selection functions。

## 驗收標準

- [ ] `go tool nm dist/server` 不得包含 `ResolveFeature`, `ResolveDependency`, `LoadModule`, `DiscoverModule`
- [ ] `grep` binary symbols 不得找到 featuregraph resolver 函數
- [ ] `RT-001` test: minimal runtime — HTTP/JWT/OAuth/OTel/K8s 不被 initialize
- [ ] `go test ./tests/runtime/...` 成功

## 備註

Critical: Feature Graph 是 build-time，not runtime. Runtime must not do feature resolution.
