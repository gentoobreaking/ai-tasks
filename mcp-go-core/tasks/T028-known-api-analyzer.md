---
github_issue: N/A
title: P4 - Known API Usage Analyzer
type: feat
priority: medium
status: done
updated: 2026-09-04
depends_on:
- T026
assignee: "pi with opencode"
created: 2026-09-04
updated: 2026-09-04
---

# T028 - P4: Known API Usage Analyzer

## 目標

偵測 `http.Configure(`, `jwt.Configure(`, `stdio.Configure(`, `sessions.Configure(`, `logging.Configure(` 等 known API 使用。

## 驗收標準

- [ ] 掃描 application source for known Configure() calls
- [ ] Map each call to inferred feature
- [ ] `AN-002` test: app calls jwt.Configure → inferred: [jwt, security]
- [ ] `go test ./internal/analyzer/...` 成功

## 備註

T026 已統攫 analyzer 整體。Known API patterns: http→http, jwt→security+jwt, stdio→stdio, sessions→sessions, logging→logging。
