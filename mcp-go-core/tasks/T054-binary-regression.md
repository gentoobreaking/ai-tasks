---
github_issue: N/A
title: P8 - Binary Regression Verification
type: test
priority: medium
status: pending
depends_on:
- T052
- T056
assignee: "pi with opencode"
created: 2026-09-04
updated: 2026-09-04
---

# T054 - P8: Binary Regression Verification

## 目標

建立 binary size regression 驗證，測量 profiles: minimal, production, secure, observable, full。

## 驗收標準

- [ ] `binary-size-report.json` 產生
- [ ] 測量所有 5 profiles 的 binary size
- [ ] Regression > 10% threshold → FAIL
- [ ] Expected dependency set vs actual binary comparison
- [ ] `go test ./tests/build/...` 成功

## 備註

不要硬編碼 binary size target。Binary size 用於 regression detection。Profile → Expected Dependency Set → Actual Binary consistency is the real criterion.
