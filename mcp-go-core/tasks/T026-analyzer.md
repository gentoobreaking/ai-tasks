---
github_issue: N/A
title: P4 - Explicit Configuration Analyzer
type: feat
priority: high
status: pending
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

- [ ] 讀取 `mcp.yaml` 中的 explicit features list
- [ ] 讀取 `.mcp/generated/metadata.json` (generated metadata)
- [ ] 偵測 known API patterns: `http.Configure(`, `jwt.Configure(`, `stdio.Configure(`, `sessions.Configure(`, `logging.Configure(`
- [ ] Minimal v0.1 Go AST analysis: scan imports for known module packages
- [ ] 推導優先順序: Explicit Config > Generated Metadata > Known API > Go AST
- [ ] 產生 `.mcp/inferred-features.json` with features list, source, hash
- [ ] Output 必須 deterministic (sort by name)
- [ ] `AN-001` test: mcp.yaml lists http → inferred: [http]
- [ ] `AN-002` test: app calls jwt.Configure → inferred: [jwt, security]
- [ ] `AN-003` test: app doesn't use oauth → oauth NOT in inferred
- [ ] `AN-004` test: determinism (identical source ×2 → identical result)
- [ ] `go test ./internal/analyzer/...` 成功

## 備註

v0.1 不要求完整 Go semantic analysis。對應 implementation_plan §8 P4。Inference priority is critical for determinism.
