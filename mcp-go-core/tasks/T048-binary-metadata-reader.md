---
github_issue: N/A
title: P7 - Binary Metadata Reader Implementation
type: feat
priority: medium
status: pending
depends_on:
- T043
assignee: "pi with opencode"
created: 2026-09-04
updated: 2026-09-04
---

# T048 - P7: Binary Metadata Reader Implementation

## 目標

建立 binary analyzer reader，提取 binary size, symbols, linked packages。

## 驗收標準

- [ ] `go tool nm dist/server` 解析 linked packages
- [ ] `go version -m dist/server` 驗證 module versions  
- [ ] Binary size measurement (raw + stripped)
- [ ] Parse symbols to detect mcp-go-core/modules/ imports
- [ ] Extract module paths from binary symbol table
- [ ] `go test ./internal/builder/...` 成功

## 備註

Method priority: go tool nm > go version -m > go list -deps。Algorithm details in algs/binary-analysis.md。This is the reader component; T049 is the verification/comparison component.
