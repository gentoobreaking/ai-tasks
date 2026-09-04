---
github_issue: N/A
title: P4 - Generated Metadata Analyzer
type: feat
priority: medium
status: pending
depends_on:
- T026
assignee: "pi with opencode"
created: 2026-09-04
updated: 2026-09-04
---

# T027 - P4: Generated Metadata Analyzer

## 目標

讀取 `.mcp/generated/metadata.json`，推導 features。

## 驗收標準

- [ ] 讀取 `.mcp/generated/metadata.json`
- [ ] 解析 metadata 中的 features 列表
- [ ] 將推導的 features 加入 inferred set
- [ ] `go test ./internal/analyzer/...` 成功

## 備註

Inference priority: Explicit Config > Generated Metadata > Known API > Go AST。T026 已統攬 analyzer 整體，本任務為子功能驗收。
