---
github_issue: N/A
title: P3 - Feature Lock Generation (Deterministic)
type: feat
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

# T021 - P3: Feature Lock Generation (Deterministic)

## 目標

產生 `.mcp/features.lock` 包含 deterministic resolution result，並確保相同 input 產生 byte-identical output。

對應 spec §4.5, feature_graph_spec §18, §19 Deterministic Ordering, algs/feature-lock.md, agent_tasks TASK-057。

## 驗收標準

- [ ] 生成 `.mcp/features.lock`
- [ ] Lock file 包含: framework_version, profile, features, modules, dependency_graph, graph_hash
- [ ] graph_hash 使用 sha256 計算
- [ ] `TestDeterministicResolution` — same input ×3 runs → byte-identical features.lock
- [ ] `LOCK-001` — graph_hash 相同輸入產生相同 hash
- [ ] `LOCK-002` — config change → graph_hash changed
- [ ] `LOCK-003` — dependency graph change → graph_hash changed
- [ ] `go test ./internal/featuregraph/...` 成功

## 備註

Algorithm details in algs/feature-lock.md. Hash input: sort(features) + sort(dependency_edges) + profile + framework_version。

## 執行紀錄 (2026-09-04 稽核)
- 驗收標準已核對 against 程式碼與測試（go build, go vet, go test 均通過）。
- 未發現缺口。
