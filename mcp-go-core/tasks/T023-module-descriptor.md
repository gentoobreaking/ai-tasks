---
github_issue: N/A
title: P3 - Module Descriptor Definition
type: feat
priority: high
status: done
updated: 2026-09-04
depends_on:
- T016
assignee: "pi with opencode"
created: 2026-09-04
updated: 2026-09-04
---

# T023 - P3: Module Descriptor Definition

## 目標

建立 ModuleDescriptor 型別，定義模組元數據。

對應 feature_graph_spec §7, architecture §4.4 Module System, agent_tasks TASK-051。

## 驗收標準

- [ ] `ModuleDescriptor` struct: Name, Version, Category, Features, Dependencies, Package, RuntimeInit
- [ ] Category 支援: Core, Transport, Security, Middleware, Runtime, Observability, Storage, Developer, Integration
- [ ] 支援 Module dependency declaration (string list)
- [ ] Package field 為 Go module path
- [ ] RuntimeInit bool 控制是否在 startup 初始化
- [ ] `go test ./internal/featuregraph/...` 成功

## 備註

Module descriptors must be registered statically (build-time), not discovered at runtime.
