---
github_issue:
title: 'Fix: deduplicate verdict logic (router vs ping)'
type: refactor
priority: medium
status: done
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-04
updated: 2026-08-04
---

# T043 - Fix: VerdictFor duplication

## 目標
`VerdictFor` (`internal/router/server.go:304`) duplicates `ping.GetVerdict` (`internal/ping/metrics.go:81`) — identical logic, drift risk. Delete the router copy and delegate to `ping.GetVerdict`.

## 驗收標準
- [ ] `router.VerdictFor` removed; server handlers call `ping.GetVerdict`
- [ ] No other references to the removed function
- [ ] `go build`, `go vet`, `go test ./...` pass

## 備註
- router 已 import ping package（TransportPool）
