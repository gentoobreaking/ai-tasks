---
github_issue:
title: 'Fix: rewriteModel failure must return 400, not failover'
type: bugfix
priority: medium
status: done
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-04
updated: 2026-08-04
---

# T041 - Fix: defensive 400 on rewriteModel failure

## 目標
In `forward` (`internal/router/routing.go`), if `rewriteModel` fails (non-object JSON body), the request is currently treated as a connection failure → `markFailure` + failover to the next model. A malformed client body should be a client error (400), not a proxy/upstream failure.

## 驗收標準
- [ ] `forward` writes 400 (with error message) and returns written=true when `rewriteModel` fails, stopping the candidate loop
- [ ] Unit test: `rewriteModel([]byte("[1,2]"), "x")` returns error; forward-level test asserts 400 status, no failover
- [ ] Existing proxy tests pass

## 備註
- 常態下第一個 Unmarshal 已擋掉非 object body，此為防禦性修正
