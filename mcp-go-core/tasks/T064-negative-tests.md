---
github_issue: N/A
title: P9 - Negative Verification Test Suite
type: test
priority: high
status: pending
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

- [ ] Invalid config → fail with deterministic error
- [ ] Unknown feature → fail with error
- [ ] Missing dependency → fail
- [ ] Conflicting feature → ERROR `FEATURE_CONFLICT`
- [ ] Dependency cycle → ERROR `FEATURE_CYCLE`
- [ ] Explicit disable of required → ERROR `FEATURE_REQUIRED`
- [ ] Stale generated code → `GENERATED_CODE_STALE`
- [ ] Unexpected binary module → `UNEXPECTED_MODULE`
- [ ] Invalid authentication → reject
- [ ] Runtime startup failure → fail correctly
- [ ] All errors have: machine-readable code + human-readable message + context
- [ ] `go test ./tests/negative/...` 成功

## 備註

Negative tests are mandatory。Each must fail correctly with deterministic error。
