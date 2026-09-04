---
github_issue: N/A
title: P6 - Benchmark Stage
type: feat
priority: medium
status: pending
depends_on:
- T044
- T055
assignee: "pi with opencode"
created: 2026-09-04
updated: 2026-09-04
---

# T045 - P6: Benchmark Stage

## 目標

實作 BenchmarkStage: 執行 build-time benchmark。

## 驗收標準

- [ ] Run dispatch benchmark (ns/op, allocs/op, B/op)
- [ ] Run startup benchmark (process start → ready)
- [ ] Run memory benchmark (RSS, heap)
- [ ] Run binary size measurement
- [ ] Report baseline metrics
- [ ] `go test ./internal/builder/...` 成功

## 備訊

Stage 10 of build pipeline。Benchmark measurements must use fixed environment for reproducibility。
