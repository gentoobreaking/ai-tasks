---
github_issue: N/A
title: P9 - Profile Verification Matrix CI
type: test
priority: high
status: pending
depends_on:
- T052
- T061
assignee: "pi with opencode"
created: 2026-09-04
updated: 2026-09-04
---

# T063 - P9: Profile Verification Matrix CI

## 目標

CI 驗證所有 build profiles: minimal, production, secure, observable, full。

## 驗收標準

- [ ] `mcp-go-core build --profile=minimal` → PASS
- [ ] `mcp-go-core build --profile=production` → PASS
- [ ] `mcp-go-core build --profile=secure` → PASS
- [ ] `mcp-go-core build --profile=observable` → PASS
- [ ] `mcp-go-core build --profile=full` → PASS
- [ ] Each build executes tests
- [ ] Profile → Expected Dependency Set → Actual Binary consistency
- [ ] `go test ./tests/profile/...` 成功

## 備註

對應 verification_manual §35 V14 Profile Verification Matrix 和 build_pipeline_spec §52 Build Verification。
