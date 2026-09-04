---
github_issue: N/A
title: P6 - Config Stage
type: feat
priority: medium
status: done
updated: 2026-09-04
depends_on:
- T038
assignee: "pi with opencode"
created: 2026-09-04
updated: 2026-09-04
---

# T042 - P6: Config Stage

## 目標

實作 ConfigStage: load mcp.yaml, validate schema。

## 驗收標準

- [ ] 讀取 mcp.yaml (profile, transport, security, runtime, observability, storage)
- [ ] Schema validation before continuing
- [ ] `Config` struct populated in BuildContext
- [ ] Invalid config → fail with actionable error
- [ ] `go test ./internal/builder/...` 成功

## 備註

Stage 01 of build pipeline。mcp.yaml schema must be validated。
