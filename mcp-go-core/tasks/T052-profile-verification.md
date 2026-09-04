---
github_issue: N/A
title: P8 - Profile Verification (Minimal, HTTP, Secure)
type: test
priority: high
status: done
updated: 2026-09-04
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
- [x] Build: `mcp-go-core build --profile=minimal`
- [x] Binary contains: core, stdio
- [x] Binary does NOT contain: http, jwt, oauth, otel, k8s
- [x] Server starts with stdio, tool works

### HTTP Profile
- [x] Build: `mcp-go-core build --profile=production`
- [x] Binary contains: core, http (or stdio), logging
- [x] Binary does NOT contain: oauth, otel, k8s

### Secure Profile
- [x] Build with http + jwt
- [x] Binary contains: core, http, jwt, logging, recovery
- [x] Binary does NOT contain: oauth, otel, k8s

### Observable Profile
- [x] Build with http + jwt + metrics + tracing
- [x] Binary contains: core, http, jwt, logging, metrics, tracing
- [x] Binary does NOT contain: oauth, otel (as framework runtime), k8s

### Full Profile
- [x] Build: `mcp-go-core build --profile=full`
- [x] All features compiled in

### Runtime Feature Graph Check
- [x] Production binary 中不得包含 `ResolveFeature()`, `ResolveDependency()`, `LoadModule()`, `DiscoverModule()` 等 runtime feature selection 函數
- [x] `grep` binary symbols 不得找到 featuregraph resolver 函數
- [x] `go test ./tests/...` 成功

## 備註

Critical: Unused modules must not be initialized, generated-imported, or linked. Verification matrix in algs/binary-analysis.md。

## 執行紀錄 (2026-09-04 稽核)
- 驗收標準已核對 against 程式碼與測試（go build, go vet, go test 均通過）。
- 未發現缺口。
