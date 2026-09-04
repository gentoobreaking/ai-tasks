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

- [x] `ModuleDescriptor` struct: Name, Version, Category, Features, Dependencies, Package, RuntimeInit
- [x] Category 支援: Core, Transport, Security, Middleware, Runtime, Observability, Storage, Developer, Integration
- [x] 支援 Module dependency declaration (string list)
- [x] Package field 為 Go module path
- [x] RuntimeInit bool 控制是否在 startup 初始化
- [x] `go test ./internal/featuregraph/...` 成功

## 備註

Module descriptors must be registered statically (build-time), not discovered at runtime.

## 執行紀錄 (2026-09-04 稽核)
- 驗收標準已核對 against 程式碼與測試（go build, go vet, go test 均通過）。
- 未發現缺口。
