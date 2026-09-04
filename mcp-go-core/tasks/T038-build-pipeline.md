---
github_issue: N/A
title: P6 - Build Context and Pipeline Interface
type: feat
priority: high
status: done
updated: 2026-09-04
depends_on:
- T026
- T030
- T018
assignee: "pi with opencode"
created: 2026-09-04
updated: 2026-09-04
---

# T038 - P6: Build Context and Pipeline Interface

## 目標

建立 `internal/builder/`，實現 BuildContext struct和 Pipeline/Stage interface。

對應 spec §4.6, build_pipeline_spec §6, §15 Build Stage Interface, §55 Build Pipeline API, algs/build-pipeline.md, agent_tasks TASK-080-TASK-081。

## 驗收標準

- [ ] `BuildContext` struct: Config, Resolution, Manifest, GeneratedDir, OutputPath
- [ ] `Stage` interface: `Name() string`, `Run(ctx, *BuildContext) error`
- [ ] `Pipeline` struct: Analyzer, Resolver, Generator, Builder, Verifier
- [ ] `Pipeline.Run(ctx, cfg) (*BuildResult, error)`
- [ ] `BuildResult` struct: OutputPath, Features, Modules, BinarySize, Duration, Verification
- [ ] Stages: ConfigStage, AnalyzeStage, ResolveStage, LockStage, GenerateStage, CompileStage, VerifyStage, BenchmarkStage
- [ ] `go test ./internal/builder/...` 成功

## 備註

Pipeline sequence: Config → Analyze → Resolve → Lock → Generate → Compile → Verify。Error propagation: every stage must produce actionable errors.
