---
github_issue: N/A
title: P5 - Generator Interface and Generated Features
type: feat
priority: high
status: done
updated: 2026-09-04
depends_on:
- T018
- T026
assignee: "pi with opencode"
created: 2026-09-04
updated: 2026-09-04
---

# T030 - P5: Generator Interface and Static Module Composition

## 目標

建立 `internal/generator/`，實現 Generator interface，產生 static composition code。

對應 spec §4.6, §4.7 Static Composition, build_pipeline_spec §11, algs/code-generation.md, algs/static-composition.md, agent_tasks TASK-070-TASK-072。

## 驗收標準

- [ ] `Generator` interface: `Generate(ctx context.Context, resolution Resolution) error`
- [ ] 生成 `.mcp/generated/features.go` (feature flag constants, metadata only)
- [ ] 生成 `.mcp/generated/modules.go` (static module composition — ONLY enabled modules)
- [ ] Generated modules.go 只 import resolved modules，NOT `modules/all`
- [ ] `modules.ConfigureAll(server)` 禁止出現在 generated code
- [ ] Import ordering deterministic (sorted by path)
- [ ] 產生 `.mcp/generated/server.go` (server bootstrap with Configure call)
- [ ] 產生 `.mcp/generated/router.go` (generated router)
- [ ] 產生 `.mcp/generated/buildinfo.go` (framework version, profile, lock hash, timestamp, git commit)
- [ ] `GEN-001` test: resolution [core,http,jwt] → generated imports contain http, jwt
- [ ] `GEN-002` test: oauth disabled → oauth import NOT present in generated code
- [ ] `GEN-003` test: direct module.Configure calls, not ConfigureAll
- [ ] `GEN-004` test: deterministic generation (same resolution ×3 → identical checksum)
- [ ] `go test ./internal/generator/...` 成功

## 備註

Critical: Generated code is the primary optimization mechanism, NOT feature flags. Algorithm details in algs/static-composition.md and algs/code-generation.md。
