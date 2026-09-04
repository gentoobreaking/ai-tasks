---
github_issue: N/A
title: P7 - Binary Metadata Reader and Module Verification
type: test
priority: high
status: done
updated: 2026-09-04
depends_on:
- T039
assignee: "pi with opencode"
created: 2026-09-04
updated: 2026-09-04
---

# T041 - P7: Binary Metadata Reader and Module Verification

## 目標

建立 binary analyzer，讀取 binary size, symbols, linked packages；驗證 expected modules 存在，unexpected modules 不存在。

對應 spec §4.7, build_pipeline_spec §21-22, §59 Acceptance Test, algs/binary-analysis.md, agent_tasks TASK-090-TASK-092。

## 驗收標準

- [ ] `go tool nm dist/server` 解析 linked packages
- [ ] `go version -m dist/server` 驗證 linked module versions
- [ ] Binary size measurement (raw + stripped)
- [ ] Expected modules (from feature lock) 必須在 binary 中
- [ ] Unexpected modules 不得在 binary 中
- [ ] Unexpected module → ERROR `UNEXPECTED_MODULE` with module name and reason
- [ ] Missing expected module → ERROR `MISSING_MODULE`
- [ ] `BIN-001` test: minimal build, http absent → PASS
- [ ] `BIN-002` test: minimal build, jwt absent → PASS
- [ ] `BIN-003` test: minimal build, oauth absent → PASS
- [ ] `BIN-004` test: minimal build, otel absent → PASS
- [ ] `N004` test: binary intentionally contains otel → `UNEXPECTED_MODULE`, FAIL
- [ ] `go test ./internal/builder/...` 成功

## 備註

Method priority: go tool nm > go version -m > go list -deps。Verification matrix in algs/binary-analysis.md。
