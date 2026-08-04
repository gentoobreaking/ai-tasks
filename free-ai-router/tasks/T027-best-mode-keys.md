---
github_issue:
title: 'Fix: --best mode applies API keys before pinging'
type: bugfix
priority: high
status: pending
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-04
updated: 2026-08-04
---

# T027 - Fix: --best mode API keys

## 目標
Fix the P0 bug where `freemodel --best` pings without API keys (all requests get 401/noauth → "no reachable models found"). `cmd/freemodel/main.go` passes a `resolveKey` closure to `cli.RunBest` but `internal/cli/best.go` never applies it. Per spec §10.3, `--best` must produce a usable model ID.

## 驗收標準
- [ ] `RunBest` uses the `resolveKey` callback to set each model's `APIKey` before pinging
- [ ] `runBest` in main.go passes the resolver correctly (keys resolved from config/env per provider)
- [ ] Mock test: engine pings a fake upstream requiring Bearer auth; assert requests carry the configured key
- [ ] Output prints a `status: up` model ID after 4 rounds, or a clear error if none reachable

## 備註
- Keys resolution order: env var > config > none (§9.3)
- Models without keys should be skipped or produce `noauth` status, not crash
