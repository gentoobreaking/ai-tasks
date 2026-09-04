---
github_issue: N/A
title: P6 - Verify Stage
type: feat
priority: medium
status: done
updated: 2026-09-04
depends_on:
- T041
- T043
assignee: "pi with opencode"
created: 2026-09-04
updated: 2026-09-04
---

# T044 - P6: Verify Stage

## 目標

實作 VerifyStage: binary audit + smoke test after compilation。

## 驗收標準

- [ ] Run binary metadata reader (go tool nm, go version -m)
- [ ] Run expected/unexpected module verification
- [ ] Run runtime smoke test (initialize, tool call, shutdown)
- [ ] VerificationResult populated in BuildResult
- [ ] `go test ./internal/builder/...` 成功

## 備註

Stage 08-09 of build pipeline：Binary Analysis → Runtime Smoke Test。
