---
github_issue: N/A
title: P3 - Feature Resolution Engine
type: feat
priority: high
status: pending
depends_on:
- T016
- T024
assignee: "pi with opencode"
created: 2026-09-04
updated: 2026-09-04
---

# T018 - P3: Feature Resolution Engine

## 目標

實作 Feature Graph resolver，將 explicit + inferred features 解析成 deterministic closure。

對應 spec §4.5 Feature Resolution, feature_graph_spec §12-15, algs/feature-resolution.md, agent_tasks TASK-054。

## 驗收標準

- [ ] `Resolve(cfg Config) (*Resolution, error)` 方法
- [ ] 實作 explicit enable/disable
- [ ] 實作 inferred feature 合併
- [ ] 實作 `implies` 擴展
- [ ] 實作 HARD dependency 擴展 (transitive closure)
- [ ] 實作用戶 explicit disable 時，若其為 hard dependency → ERROR `FEATURE_REQUIRED`
- [ ] Output 排序 deterministic (category → name)
- [ ] `TestBasicDependency` PASS (A→B, enable A → A,B)
- [ ] `TestTransitiveDependency` PASS (A→B→C, enable A → A,B,C)
- [ ] `TestExplicitDisable` — disable hard dependency → ERROR `FEATURE_REQUIRED`
- [ ] `TestConflict` — conflict features → ERROR `FEATURE_CONFLICT`
- [ ] `TestDeterministicResolution` — same input ×3 → byte-identical

## 備註

Algorithm details in algs/feature-resolution.md. Priority: REQUIRED > EXPLICIT DISABLE > EXPLICIT ENABLE > INFERRED > AUTO。
