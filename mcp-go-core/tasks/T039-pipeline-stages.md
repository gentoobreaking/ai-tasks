---
github_issue: N/A
title: P6 - Pipeline Stages (Config, Analyze, Resolve, Lock, Generate, Compile)
type: feat
priority: high
status: done
updated: 2026-09-04
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

- [x] `ConfigStage`: load mcp.yaml, validate schema
- [x] `AnalyzeStage`: run analyzer → inferred-features.json
- [x] `ResolveStage`: run feature resolver → Resolution
- [x] `LockStage`: write features.lock
- [x] `GenerateStage`: generate .mcp/generated/*.go
- [x] `CompileStage`: go build with profile-specific flags (minimal: -trimpath; production: -trimpath -ldflags="-s -w")
- [x] CGO_ENABLED=0 default
- [x] Verbose mode: [1/7]...[7/7] progress output
- [x] Error: invalid config → fail with actionable error code
- [x] Error: feature conflict → fail with FEATURE_CONFLICT
- [x] Error: feature cycle → fail with FEATURE_CYCLE
- [x] Error: FEATURE_REQUIRED → fail
- [x] `go test ./internal/builder/...` 成功

## 備註

Each stage must produce actionable errors, not generic "build failed"。

## 執行紀錄 (2026-09-04 稽核)
- 驗收標準已核對 against 程式碼與測試（go build, go vet, go test 均通過）。
- 未發現缺口。
