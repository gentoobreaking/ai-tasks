---
github_issue: N/A
title: P3 - Dependency Closure Verification
type: test
priority: high
status: done
updated: 2026-09-04
depends_on:
- T018
- T019
assignee: "pi with opencode"
created: 2026-09-04
updated: 2026-09-04
---

# T025 - P3: Dependency Closure Verification

## 目標

驗證 dependency closure invariant: 每個 enabled feature 的所有 HARD dependencies 必須也被 enabled。

對應 spec §4.5, feature_graph_spec §25 Dependency Closure, §27 INV-002, implementation_plan §7 P3。

## 驗收標準

- [ ] `validate_required_dependencies(features)` 函數
- [ ] FOR every enabled feature F: all HARD dependencies of F must also be enabled
- [ ] 否則 → ERROR `FEATURE_REQUIRED`
- [ ] `TestRequiredDependency` PASS — A requires B (hard), A enabled → B must present
- [ ] `TestTransitiveDependency` PASS — A→B→C, enable A → A,B,C all present
- [ ] `TestMinimalResolution` — no unnecessary features enabled
- [ ] `TestProfileResolution` — development/production/minimal/secure/observable/full profiles
- [ ] `go test ./internal/featuregraph/...` 成功

## 備註

Invariant INV-002: ∀ F ∈ Enabled: Dependencies(F) ⊆ Enabled。Invariant INV-006: Core always enabled。
