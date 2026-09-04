---
github_issue: N/A
title: P8 - Startup and Memory Benchmarks
type: test
priority: medium
status: done
updated: 2026-09-04
depends_on:
- T055
- T039
- T040
assignee: "pi with opencode"
created: 2026-09-04
updated: 2026-09-04
---

# T056 - P8: Startup and Memory Benchmarks

## 目標

建立 startup/memory benchmark，測量 process start → ready時間, RSS, heap, allocations。

對應 spec §4.8, architecture §46.4 Startup, §46.3 Memory, §46.5 Binary Size, implementation_plan §12 P8, agent_tasks TASK-112-TASK-114。

## 驗收標準

- [ ] `benchmarks/startup_test.go` 建立
- [ ] 測量: process start → MCP ready
- [ ] Initial target: < 50 ms (minimal config)
- [ ] 測量至少 10 次
- [ ] 報告: min, median, p95, max
- [ ] 測量: cold start, warm start, with security, with observability
- [ ] `benchmarks/memory_test.go` 建立
- [ ] 測量: RSS, heap, allocations
- [ ] Minimal RSS target: < 20 MB
- [ ] Production RSS target: < 30 MB (before app deps)
- [ ] `benchmarks/binary_test.go` 建立
- [ ] 比較 profiles: minimal, production, secure, observable, full
- [ ] 報告 binary size, startup, RSS
- [ ] `go test -bench=. ./benchmarks/...` 執行成功

## 備註

RSS 受 OS/runtime/allocator/container 影響。Baseline + regression 比單一絕對值重要。Binary size 不得硬編碼目標，必須基於 benchmark。
