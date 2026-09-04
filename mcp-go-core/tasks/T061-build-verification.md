---
github_issue: N/A
title: P9 - Build Verification and Binary Dependency Gate
type: test
priority: high
status: pending
depends_on:
- T039
- T040
- T041
- T060
assignee: "pi with opencode"
created: 2026-09-04
updated: 2026-09-04
---

# T061 - P9: Build Verification and Binary Dependency Gate

## 目標

建立 build verification with multiple profiles and binary dependency gate。

對應 spec §4.8, build_pipeline_spec §44, §47-50, verification_manual §17 V17, §20 Binary Inspection, §25 Binary Size Verification, §30 Binary Inspection, §34 Reproducible Build, agent_tasks TASK-123-TASK-125。

## 驗收標準

- [ ] CI builds 5 profiles: minimal, production, secure, observable, full
- [ ] Each build executes tests
- [ ] `mcp-go-core build --profile=production --verify` works
- [ ] Binary dependency gate: unexpected module → FAIL
- [ ] `mcp-go-core doctor dist/server` — inspect binary, show enabled features, show modules, detect unexpected deps
- [ ] Performance regression gate: P99 latency > 10% threshold → FAIL
- [ ] RSS regression > 10% → FAIL
- [ ] Binary size regression > 10% → FAIL
- [ ] `go test ./tests/integration/... ./tests/build/...` 成功

## 備註

Reproducible build: same source + same Go version + same framework version + same feature lock + same build config → same output. Build manifest includes framework version, Go version, git commit, feature lock hash, build timestamp, build profile.
