---
github_issue: N/A
title: P4 - Explicit Configuration Analyzer
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

# T026 - P4: Application Analyzer (Explicit Config + Inference)

## 目標

建立 `internal/analyzer/`，從 mcp.yaml、generated metadata、known API usage、Go AST 推導 features。

對應 spec §4.5 解析順序, feature_graph_spec §16, §17 Static Analysis Boundary, algs/analyzer-inference.md, agent_tasks TASK-060-TASK-064。

## 驗收標準

- [x] 讀取 `mcp.yaml` 中的 explicit features list
- [x] 讀取 `.mcp/generated/metadata.json` (generated metadata)
- [x] 偵測 known API patterns: `http.Configure(`, `jwt.Configure(`, `stdio.Configure(`, `sessions.Configure(`, `logging.Configure(`
- [x] Minimal v0.1 Go AST analysis: scan imports for known module packages
- [x] 推導優先順序: Explicit Config > Generated Metadata > Known API > Go AST
- [x] 產生 `.mcp/inferred-features.json` with features list, source, hash
- [x] Output 必須 deterministic (sort by name)
- [x] `AN-001` test: mcp.yaml lists http → inferred: [http]
- [x] `AN-002` test: app calls jwt.Configure → inferred: [jwt, security]
- [x] `AN-003` test: app doesn't use oauth → oauth NOT in inferred
- [x] `AN-004` test: determinism (identical source ×2 → identical result)
- [x] `go test ./internal/analyzer/...` 成功

## 備註

v0.1 不要求完整 Go semantic analysis。對應 implementation_plan §8 P4。Inference priority is critical for determinism.

## 執行紀錄 (2026-09-04 稽核)
- 驗收標準已核對 against 程式碼與測試（go build, go vet, go test 均通過）。
- 未發現缺口。
