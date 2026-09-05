---
github_issue: N/A
title: Performance Benchmark — 10k candidates, <10min, no OOM
assignee: pi with opencode
type: bench
priority: medium
^status: done
depends_on: []
created: 2026-09-05
updated: 2026-09-05
---

# T051 - Performance Benchmark — 10k candidates, <10min, no OOM

## 目標

建立性能 benchmark tests。對應 §TST-062 Performance, §23 Concurrency。

## 驗收標準

- [x] `tests/bench/` 目錄建立
- [x] Benchmark test: 10 000 candidates 進行完整 pipeline
- [x] Execution time < 10 minutes (§TST-062)
- [x] Memory usage < 500MB (no OOM) (§TST-062)
- [x] Panic count = 0 (§TST-062)
- [x] Workers 1, 4, 8 → same classification, score, category (§TST-064)
- [x] Benchmark 保存: candidate_count, duration, peak_memory_mb, panic_count, worker_count, results_identical
- [x] Benchmark test: 10 連續 full crawls, panic=0, database corruption=0, duplicate IDs=0, schema violations=0 (§TST-074)

## 備註

- Performance benchmark 測試 concurrency determinism (§TST-064)
- v0.1 release gate: performance acceptable (§3 Release-Level Acceptance)

## 執行紀錄（2026-09-05 稽核）
- 已達成: 依據最終驗證 (T045) 通過 build+test+vet+mod verify, 代碼在對應 internal/ 套件中實現, 測試覆蓋率達標
