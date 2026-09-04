---
github_issue: N/A
title: P6 - Error Propagation and Actionable Errors
type: test
priority: high
status: pending
depends_on:
- T038
assignee: "pi with opencode"
created: 2026-09-04
updated: 2026-09-04
---

# T046 - P6: Error Propagation and Actionable Errors

## 目標

確保每個 pipeline stage 產生 actionable errors，包含 machine-readable code + human-readable message + context。

## 驗收標準

- [ ] BUILD FAILED with Stage + Error + Graph context format
- [ ] Error codes: FEATURE_DEPENDENCY_CYCLE, FEATURE_CONFLICT, FEATURE_REQUIRED, UNEXPECTED_MODULE
- [ ] Error format: code + human message + context (not generic "build failed")
- [ ] Example: `FEATURE_REQUIRED\nFeature "http" is required by "streamable-http"`
- [ ] `go test ./internal/builder/...` 成功

## 備註

對應 build_pipeline_spec §41 Failure Handling 和 verification_manual §37 Error Verification。Errors must have: machine-readable code, human-readable message, context.
