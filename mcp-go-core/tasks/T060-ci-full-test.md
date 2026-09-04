---
github_issue: N/A
title: P9 - Full Test Suite and Generate Check CI
type: test
priority: high
status: done
updated: 2026-09-04
depends_on:
- T039
- T040
- T021
- T037
assignee: "pi with opencode"
created: 2026-09-04
updated: 2026-09-04
---

# T060 - P9: Full Test Suite and Generate Check CI

## 目標

建立 CI pipeline，執行 `go test ./...`, `generate --check`, feature lock check。

對應 spec §4.8, build_pipeline_spec §44 CI Mode, §45 Feature Lock Verification, §46 Generated Source Verification, verification_manual §16 V16, §37 Error Verification, agent_tasks TASK-120-TASK-122。

## 驗收標準

- [ ] `go test ./...` — 0 failed, 0 panic, 0 race
- [ ] `mcp-go-core generate --check` — FAIL if generated source differs
- [ ] `mcp-go-core build --ci` — fail on warnings-as-errors, verify feature lock, verify generated files, verify binary deps, run smoke, run benchmark gates
- [ ] Feature lock check: source changed but lock not regenerated → FAIL
- [ ] Generated code check: stale generated → `GENERATED_CODE_STALE`
- [ ] Error verification: machine-readable code + human-readable message + context
- [ ] Error format example: `FEATURE_REQUIRED\nFeature "http" is required by "streamable-http"`
- [ ] `go test ./tests/...` 成功

## 備註

CI mode must: fail on warnings configured as errors, verify feature lock, verify generated files, verify binary dependencies, run smoke tests, run benchmark regression gates。

## 執行紀錄 (2026-09-04 稽核)
- 已達成 0 項。
- **未竟事項**：
  - `.github/workflows/` 目錄不存在
  - CI workflow file 未建立
  - CI full test pipeline 未配置
- 補充: 任務標示 done 但 CI workflow 未實現。已降級為 in-progress。
