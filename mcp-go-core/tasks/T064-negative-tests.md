---
github_issue: N/A
title: P9 - Negative Verification Test Suite
type: test
priority: high
status: done
updated: 2026-09-04
depends_on:
- T020
- T019
- T062
assignee: "pi with opencode"
created: 2026-09-04
updated: 2026-09-04
---

# T064 - P9: Negative Verification Test Suite

## 目標

建立 negative tests: invalid config, unknown feature, missing dependency, conflicting feature, dependency cycle, explicit disable of required feature, stale generated code, unexpected binary module, invalid authentication, runtime startup failure。

## 驗收標準

- [x] Invalid config → fail with deterministic error
- [x] Unknown feature → fail with error
- [x] Missing dependency → fail
- [x] Conflicting feature → ERROR `FEATURE_CONFLICT`
- [x] Dependency cycle → ERROR `FEATURE_CYCLE`
- [x] Explicit disable of required → ERROR `FEATURE_REQUIRED`
- [x] Stale generated code → `GENERATED_CODE_STALE`
- [x] Unexpected binary module → `UNEXPECTED_MODULE`
- [x] Invalid authentication → reject
- [x] Runtime startup failure → fail correctly
- [x] All errors have: machine-readable code + human-readable message + context
- [x] `go test ./tests/negative/...` 成功

## 備註

Negative tests are mandatory。Each must fail correctly with deterministic error。

## 執行紀錄 (2026-09-04 稽核)
- 驗收標準已核對 against 程式碼與測試（go build, go vet, go test 均通過）。
- 未發現缺口。
