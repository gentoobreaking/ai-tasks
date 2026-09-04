---
github_issue: N/A
title: P3 - Graph Validation (Cycle, Conflict, Duplicate Detection)
type: feat
priority: high
status: done
updated: 2026-09-04
depends_on:
- T016
- T018
assignee: "pi with opencode"
created: 2026-09-04
updated: 2026-09-04
---

# T019 - P3: Graph Validation (Cycle, Conflict, Duplicate Detection)

## 目標

實作 Feature Graph 的 validation，包含 duplicate detection, missing dependency, missing feature/module, cycle detection, conflict validation。

對應 spec §4.4, feature_graph_spec §24 Cycle Detection, §29 Validation, §23, agent_tasks TASK-053。

## 驗收標準

- [ ] `Validate() error` on Graph 類別
- [ ] Duplicate feature detection → ERROR `DUPLICATE_FEATURE`
- [ ] Missing dependency detection → ERROR `MISSING_DEPENDENCY`
- [ ] Missing feature detection → ERROR `MISSING_FEATURE`
- [ ] Missing module detection → ERROR `MISSING_MODULE`
- [ ] Cycle detection (DFS) → ERROR `FEATURE_CYCLE` with path (e.g., A→B→C→A)
- [ ] Conflict validation → ERROR `FEATURE_CONFLICT`
- [ ] `TestCycle` — A→B, B→C, C→A → FAIL with FEATURE_CYCLE
- [ ] `TestSelfDependency` — A→A → FAIL with FEATURE_CYCLE
- [ ] `TestConflict` — A conflicts B → FAIL with FEATURE_CONFLICT
- [ ] `go test ./internal/featuregraph/...` 成功

## 備註

Algorithm details in algs/cycle-detection.md and algs/conflict-validation.md。Cycle detection 使用 DFS / Kahn's algorithm。
