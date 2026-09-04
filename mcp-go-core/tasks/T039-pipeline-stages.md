---
github_issue: N/A
title: P6 - Pipeline Stages (Config, Analyze, Resolve, Lock, Generate, Compile)
type: feat
priority: high
status: pending
depends_on:
- T038
- T026
- T018
- T021
- T030
assignee: "pi with opencode"
created: 2026-09-04
updated: 2026-09-04
---

# T039 - P6: Pipeline Stages Implementation

## 目標

實作 Pipeline 的各個 Stage: Config, Analyze, Resolve, Lock, Generate, Compile。

對應 spec §4.6, build_pipeline_spec §4-10, §15, algs/build-pipeline.md, agent_tasks TASK-082-TASK-087。

## 驗收標準

- [ ] `ConfigStage`: load mcp.yaml, validate schema
- [ ] `AnalyzeStage`: run analyzer → inferred-features.json
- [ ] `ResolveStage`: run feature resolver → Resolution
- [ ] `LockStage`: write features.lock
- [ ] `GenerateStage`: generate .mcp/generated/*.go
- [ ] `CompileStage`: go build with profile-specific flags (minimal: -trimpath; production: -trimpath -ldflags="-s -w")
- [ ] CGO_ENABLED=0 default
- [ ] Verbose mode: [1/7]...[7/7] progress output
- [ ] Error: invalid config → fail with actionable error code
- [ ] Error: feature conflict → fail with FEATURE_CONFLICT
- [ ] Error: feature cycle → fail with FEATURE_CYCLE
- [ ] Error: FEATURE_REQUIRED → fail
- [ ] `go test ./internal/builder/...` 成功

## 備註

Each stage must produce actionable errors, not generic "build failed"。
