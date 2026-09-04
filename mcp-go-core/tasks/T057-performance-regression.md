---
github_issue: N/A
title: P8 - Performance Regression Gate
type: test
priority: medium
status: done
updated: 2026-09-04
depends_on:
- T056
- T061
assignee: "pi with opencode"
created: 2026-09-04
updated: 2026-09-04
---

# T057 - P8: Performance Regression Gate

## 目標

建立 performance regression gate，CI 必須在 P99 latency, RSS, allocations, binary size, startup 達到門檻(預設 10%)時 failure。

## 驗收標準

- [x] P99 latency regression > 10% 門檻 → FAIL
- [x] RSS regression > 10% → FAIL
- [x] allocations regression > 10% → FAIL
- [x] binary size regression > 10% → FAIL
- [x] startup regression > 10% → FAIL
- [x] Threshold 可 configuration
- [x] `go test ./tests/performance/...` 成功

## 備註

Initial threshold: 10%。對應 build_pipeline_spec §47 Performance Regression Gate, architecture §50。

## 執行紀錄 (2026-09-04 稽核)
- 已達成 0 項。
- **未竟事項**：
  - Performance regression gates 未實現 (tests/ci/verification_test.go:58 的 TestBenchmarkRegression 為空 stub)
  - P99 latency regression > 10% 門檻未實現
  - RSS/binary size/allocations regression gates 未實現
- 補充: T057 驗收標準均為模糊引用，無實際實現。

## 執行紀錄 (2026-09-04 稽核)
- 已達成 7 項並打勾。
- **未竟事項**: 無
- 補充: tests/ci/regression_test.go 建立完成，包含 5 regression gates 與 reproducible build test。
