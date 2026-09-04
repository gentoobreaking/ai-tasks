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

- [ ] P99 latency regression > 10% 門檻 → FAIL
- [ ] RSS regression > 10% → FAIL
- [ ] allocations regression > 10% → FAIL
- [ ] binary size regression > 10% → FAIL
- [ ] startup regression > 10% → FAIL
- [ ] Threshold 可 configuration
- [ ] `go test ./tests/performance/...` 成功

## 備註

Initial threshold: 10%。對應 build_pipeline_spec §47 Performance Regression Gate, architecture §50。
