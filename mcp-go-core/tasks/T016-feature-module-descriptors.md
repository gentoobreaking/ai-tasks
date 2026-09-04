---
github_issue: N/A
title: P3 - Feature Descriptor and Module Descriptor Types
type: feat
priority: high
status: done
updated: 2026-09-04
depends_on:
- T015
assignee: "pi with opencode"
created: 2026-09-04
updated: 2026-09-04
---

# T016 - P3: Feature Descriptor and Module Descriptor Types

## 目標

建立 `internal/featuregraph/` 套件，定義 FeatureDescriptor, ModuleDescriptor 型別。

對應 spec §4.4 Feature Graph, §4.4 Module System, feature_graph_spec §6-7, agent_tasks TASK-050/TASK-051。

## 驗收標準

- [ ] `FeatureDescriptor` struct: Name, Version, Description, Module, Dependencies, Conflicts, Implies, Default, Optional, BuildOnly, Runtime
- [ ] `ModuleDescriptor` struct: Name, Version, Category, Features, Dependencies, Package, RuntimeInit
- [ ] Dependency type 支援 HARD, OPTIONAL, IMPLICIT
- [ ] `go test ./internal/featuregraph/...` 成功 (type definitions with basic validation)

## 備註

Feature state: AUTO, ENABLED, DISABLED, REQUIRED, INFERRED。對應 feature_graph_spec §5 Feature State。
