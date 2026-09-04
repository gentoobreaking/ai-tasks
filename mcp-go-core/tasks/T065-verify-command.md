---
github_issue: N/A
title: P9 - End-to-End Verification Command
type: test
priority: high
status: pending
depends_on:
- T068
- T059
assignee: "pi with opencode"
created: 2026-09-04
updated: 2026-09-04
---

# T065 - P9: End-to-End Verification Command

## 目標

實作 `mcp-go-core verify` 命令，一次執行所有驗證。

## 驗收標準

- [ ] `mcp-go-core verify` 執行所有驗證階段
- [ ] Pipeline: Static Check → Unit Test → Feature Graph Test → Analyzer Test → Generator Check → Build → Binary Audit → Runtime Smoke Test → Benchmark → Reproducibility Check → Verification Report
- [ ] Final output 顯示: Static PASS/FAIL, Unit PASS/FAIL, Feature Graph PASS/FAIL, etc.
- [ ] `FINAL RESULT: ACCEPTED / REJECTED`
- [ ] `go test ./tests/verification/...` 成功

## 備註

verification_manual §53 Final Verification Command。Ideal: one command runs everything。
