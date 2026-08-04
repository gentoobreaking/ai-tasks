---
github_issue:
title: Fix: Proxy model field rewrite to resolved upstream ID
type: bugfix
priority: high
status: done
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-04
updated: 2026-08-04
---

# T026 - Fix: Proxy model field rewrite

## 目標
Fix the P0 bug where `internal/router/routing.go:225` forwards the request body unchanged, so `auto-fastest` / group alias / `tag:` requests are sent upstream with a literal model name that providers reject. Per spec §7.3 step 6, the proxy must rewrite the `model` field to the resolved `m.UpstreamModelID` before forwarding.

## 驗收標準
- [ ] `forward()` rewrites the `model` field in the outgoing body to `m.UpstreamModelID` (JSON-aware rewrite, not naive string replace)
- [ ] Streaming and non-streaming requests both use the rewritten body
- [ ] Exact-match requests (`provider/model-id`) forward with the same resolved ID
- [ ] New e2e test: mock upstream records the received body; assert `model` field == resolved upstream ID when client requests `auto-fastest`, a group alias, and `tag:coding`
- [ ] All existing tests still pass

## 備註
- 原始 body 必須完整保留其他欄位（messages、stream、max_tokens 等）
- 使用 `encoding/json` 的 map round-trip 重寫 model 欄位
