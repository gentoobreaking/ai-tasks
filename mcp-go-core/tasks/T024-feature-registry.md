---
github_issue: N/A
title: P3 - Feature Registry (Internal Only)
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

# T024 - P3: Feature Registry (Internal Only)

## 目標

建立 internal feature registry，僅允許 CLI/Analyzer/Resolver/Generator/Verifier 使用。不得被 runtime import。

對應 spec §4.4 Feature Graph, feature_graph_spec §30, agent_tasks TASK-052。

## 驗收標準

- [ ] `Registry` type 提供: `Register`, `Get`, `List`, `Validate` 方法
- [ ] Registry 位於 `internal/featuregraph/`
- [ ] `go list -deps ./core/...` 不得顯示 internal/featuregraph
- [ ] `go list -deps ./examples/minimal/...` 不得顯示 internal/analyzer, internal/generator, internal/builder, internal/featuregraph
- [ ] Registry 只允許 build-time 存取 (CLI, builder, generator)
- [ ] `go test ./internal/featuregraph/...` 成功

## 備註

Critical: Registry 必須只存在於 build time，不得進入 production binary。對應 architecture §19.3 禁止 umbrella runtime init。

## 執行紀錄 (2026-09-04 稽核)
- 驗收標準已核對 against 程式碼與測試（go build, go vet, go test 均通過）。
- 未發現缺口。
