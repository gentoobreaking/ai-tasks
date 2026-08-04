---
github_issue:
title: 'Fix: Shared keep-alive transport pool for proxy (connection reuse)'
type: bugfix
priority: high
status: done
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-04
updated: 2026-08-04
---

# T033 - Fix: Proxy connection reuse

## 目標
Fix the P1 bug where `forward()` creates a new `http.Client` per request (`routing.go:235`), so every proxied request opens a fresh TCP+TLS connection. Per Requirement #6 / §7.4, proxy requests must flow through the shared per-host keep-alive transport pool (`MaxIdleConns=200`, `MaxIdleConnsPerHost=100`, `IdleConnTimeout=90s`).

## 驗收標準
- [ ] Router owns a `ping.TransportPool` (shared with server mode engine)
- [ ] `forward()` uses the pooled transport instead of a per-request client
- [ ] Failover on same host reuses the pooled connection; cross-provider uses per-host transport cache (§7.4)
- [ ] Streaming responses unaffected (Flusher still works)
- [ ] Test: two consecutive proxy requests to the same mock host reuse the same TCP connection (mock counts distinct connections)

## 備註
- TransportPool 已存在於 ping package，直接重用
- 注意 proxy timeout 與 streaming 的相容性
