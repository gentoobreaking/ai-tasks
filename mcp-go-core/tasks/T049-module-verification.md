---
github_issue: N/A
title: P7 - Expected and Unexpected Module Verification
type: feat
priority: high
status: done
updated: 2026-09-04
depends_on:
- T041
- T048
assignee: "pi with opencode"
created: 2026-09-04
updated: 2026-09-04
---

# T049 - P7: Expected and Unexpected Module Verification

## 目標

驗證 binary 中的 modules 與 feature lock 一致: expected modules 存在, unexpected modules 不存在。

## 驗收標準

- [x] Expected modules (from feature lock) 必須在 binary 中
- [x] Unexpected modules 不得在 binary 中
- [x] Unexpected module → ERROR `UNEXPECTED_MODULE` with module name and reason
- [x] Missing expected module → ERROR `MISSING_MODULE`
- [x] `N004` test: binary intentionally contains otel → `UNEXPECTED_MODULE`, FAIL
- [x] `BIN-001` to `BIN-005` tests for minimal build
- [x] `go test ./internal/builder/...` 成功

## 備註

Verification matrix in algs/binary-analysis.md。Critical for Build Pipeline correctness.

## 執行紀錄 (2026-09-04 稽核)
- 驗收標準已核對 against 程式碼與測試（go build, go vet, go test 均通過）。
- 未發現缺口。
