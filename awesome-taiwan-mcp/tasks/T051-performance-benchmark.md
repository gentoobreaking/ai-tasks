---
github_issue: N/A
title: Performance Benchmark — 10k candidates, <10min, no OOM
type: bench
priority: medium
status: pending
depends_on: [T029]
assignee: agent
created: 2026-09-05
updated: 2026-09-05
---

# T051 - Performance Benchmark — 10k candidates, <10min, no OOM

## 目標

建立性能 benchmark tests。對應 §TST-062 Performance, §23 Concurrency。

## 驗收標準

- [ ] `tests/bench/` 目錄建立
- [ ] Benchmark test: 10 000 candidates 進行完整 pipeline
- [ ] Execution time < 10 minutes (§TST-062)
- [ ] Memory usage < 500MB (no OOM) (§TST-062)
- [ ] Panic count = 0 (§TST-062)
- [ ] Workers 1, 4, 8 → same classification, score, category (§TST-064)
- [ ] Benchmark 保存: candidate_count, duration, peak_memory_mb, panic_count, worker_count, results_identical
- [ ] Benchmark test: 10 連續 full crawls, panic=0, database corruption=0, duplicate IDs=0, schema violations=0 (§TST-074)

## 備註

- Performance benchmark 測試 concurrency determinism (§TST-064)
- v0.1 release gate: performance acceptable (§3 Release-Level Acceptance)
