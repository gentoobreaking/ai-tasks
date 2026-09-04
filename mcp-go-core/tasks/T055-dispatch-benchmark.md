---
github_issue: N/A
title: P8 - Dispatch and Throughput Benchmarks
type: test
priority: medium
status: pending
depends_on:
- T009
- T010
- T008
assignee: "pi with opencode"
created: 2026-09-04
updated: 2026-09-04
---

# T055 - P8: Dispatch and Throughput Benchmarks

## 目標

建立 benchmarks/，實現 BenchmarkToolDispatch，測量 ns/op, allocs/op, B/op, throughput。

對應 spec §4.8, architecture §44 Benchmark Architecture, §45 Baselines, §46-49 KPI, §50 Regression Gate, implementation_plan §12 P8, agent_tasks TASK-110-TASK-111。

## 驗收標準

- [ ] `benchmarks/dispatch_test.go` 建立
- [ ] `BenchmarkToolDispatch` 測量: ns/op, allocs/op, B/op
- [ ] Minimal dispatch target: P50 < 10 µs, P99 < 100 µs
- [ ] Throughput target: > 100k requests/sec (synthetic, in-process)
- [ ] `BenchmarkToolDispatch` 使用 minimal server (core + stdio)
- [ ] Allocation target: allocs/op ≈ 0 for minimal direct tool dispatch
- [ ] Benchmark 測試 matrix:
  - minimal | 1 tool | none auth | no otel | no tasks
  - minimal | 10 tools | none auth | no otel | no tasks
  - production | 10 tools | JWT | no otel | no tasks
  - observable | 10 tools | JWT | yes otel | no tasks
  - full | 10 tools | JWT | yes otel | yes tasks
- [ ] `go test -bench=. ./benchmarks/...` 執行成功

## 備註

Benchmark 比較必須: A. Raw Go MCP, B. mcp-go-core minimal, C. mcp-go-core production, D. mcp-go-core full。P50/P99 需要額外 harness。
