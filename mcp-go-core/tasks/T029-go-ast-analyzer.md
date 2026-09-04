---
github_issue: N/A
title: P4 - Go AST Analyzer (Minimal)
type: feat
priority: medium
status: done
updated: 2026-09-04
depends_on:
- T026
assignee: "pi with opencode"
created: 2026-09-04
updated: 2026-09-04
---

# T029 - P4: Go AST Analyzer (Minimal)

## 目標

Minimal v0.1 Go AST analysis: 掃描 imports for known module packages。不得實作成完整 Go compiler。

## 驗收標準

- [ ] Parse Go files in application directory
- [ ] Scan import paths for known module packages
- [ ] Map known imports to features
- [ ] Inference priority: Explicit Config > Generated Metadata > Known API > Go AST Analysis
- [ ] `go test ./internal/analyzer/...` 成功

## 備註

v0.1 不要求完整 AST inference。Go AST analysis is the lowest priority inference source.
