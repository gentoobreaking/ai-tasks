---
github_issue: N/A
title: P8 - Profile Verification (Minimal, HTTP, Secure)
type: test
priority: high
status: pending
depends_on:
- T051
- T010
- T011
- T013
- T039
- T040
- T041
assignee: "pi with opencode"
created: 2026-09-04
updated: 2026-09-04
---

# T052 - P8: Profile Verification (Minimal, HTTP, Secure, Observable, Full)

## 目標

測試所有 build profiles，驗證 binary 僅包含正確的 modules，未使用的 feature 不該進入 binary。

對應 spec §4.8, build_pipeline_spec §27-28, §52, verification_manual §14-16, §25-27, §42 Scenario B/D, agent_tasks TASK-101-TASK-103。

## 驗收標準

### Minimal Profile
- [ ] Build: `mcp-go-core build --profile=minimal`
- [ ] Binary contains: core, stdio
- [ ] Binary does NOT contain: http, jwt, oauth, otel, k8s
- [ ] Server starts with stdio, tool works

### HTTP Profile
- [ ] Build: `mcp-go-core build --profile=production`
- [ ] Binary contains: core, http (or stdio), logging
- [ ] Binary does NOT contain: oauth, otel, k8s

### Secure Profile
- [ ] Build with http + jwt
- [ ] Binary contains: core, http, jwt, logging, recovery
- [ ] Binary does NOT contain: oauth, otel, k8s

### Observable Profile
- [ ] Build with http + jwt + metrics + tracing
- [ ] Binary contains: core, http, jwt, logging, metrics, tracing
- [ ] Binary does NOT contain: oauth, otel (as framework runtime), k8s

### Full Profile
- [ ] Build: `mcp-go-core build --profile=full`
- [ ] All features compiled in

### Runtime Feature Graph Check
- [ ] Production binary 中不得包含 `ResolveFeature()`, `ResolveDependency()`, `LoadModule()`, `DiscoverModule()` 等 runtime feature selection 函數
- [ ] `grep` binary symbols 不得找到 featuregraph resolver 函數
- [ ] `go test ./tests/...` 成功

## 備註

Critical: Unused modules must not be initialized, generated-imported, or linked. Verification matrix in algs/binary-analysis.md。
