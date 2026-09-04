---
github_issue: N/A
title: P10 - Final End-to-End Verification
type: test
priority: high
status: done
updated: 2026-09-04
depends_on:
- T052
- T060
- T061
- T066
- T067
- T037
- T041
assignee: "pi with opencode"
created: 2026-09-04
updated: 2026-09-04
---

# T068 - P10: Final End-to-End Verification

## 目標

執行完整 end-to-end 驗證，確認 v0.1 acceptance criteria 全部滿足。

對應 spec §5 Definition of Done, verification_manual §16 V16, §22 Final Proof, §36 Error Verification, §54 Definition of Verification Complete, agent_tasks §22 Final v0.1 Acceptance。

## 驗收標準

### End-to-End Pipeline (clean workspace)
- [ ] `rm -rf .mcp dist`
- [ ] `mcp-go-core analyze` — generates inferred-features.json
- [ ] `mcp-go-core generate` — generates .mcp/generated/
- [ ] `mcp-go-core build --profile=minimal --verify` — produces dist/server
- [ ] `mcp-go-core doctor` — runs all checks
- [ ] `mcp-go-core benchmark` — runs benchmark suite
- [ ] `go test ./...` — 0 failed
- [ ] `go test -race ./...` — 0 race
- [ ] `go vet ./...` — 0 errors
- [ ] `gofmt -l .` — empty output

### Case A — Minimal (stdio + 1 tool)
- [ ] Feature Graph: core, stdio
- [ ] Generated imports: core, stdio only
- [ ] Binary: core, stdio, application
- [ ] Runtime: starts, initialize, tool call, shutdown

### Case B — HTTP (http + 1 tool)
- [ ] Feature Graph: core, http
- [ ] Binary does NOT contain: jwt, oauth, otel, k8s

### Case C — Secure HTTP (http + jwt)
- [ ] Feature Graph: core, http, jwt
- [ ] Binary does NOT contain: oauth, otel, k8s

### Case D — Unused Feature
- [ ] Application not using: OAuth, OTel, Kubernetes, Storage, Tasks
- [ ] These capabilities: not initialized, not generated-imported, not in binary

### Architecture Integrity
- [ ] Feature Graph is build-time (not runtime)
- [ ] Generated Composition is static
- [ ] Runtime does not do feature resolution
- [ ] Unused modules not generated-imported
- [ ] Unused modules not in production binary
- [ ] Core does not depend on optional modules
- [ ] Optional modules in independent packages

### Final Proof Equation
- [ ] Unused Feature = Not Resolved = Not Generated = Not Imported = Not Initialized = Not Linked = Not In Production Binary

### Verification Report
- [ ] `verification/VERIFICATION_REPORT.md` 建立
- [ ] 包含: Environment, Functional, Feature Graph, Generator, Build, Binary Audit, Runtime, Security, Performance, Reproducibility, Critical Failures, Warnings, Final Decision

## 備註

Final report must include completion matrix: Static, Unit, Feature Graph, Analyzer, Generator, Build, Binary, Runtime, Security, Performance, Reproducibility — all with Passed/Failed/Blocked counts.
