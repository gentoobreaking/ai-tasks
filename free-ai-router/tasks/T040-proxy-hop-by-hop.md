---
github_issue:
title: 'Fix: strip hop-by-hop headers in proxy copyHeaders'
type: bugfix
priority: high
status: done
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-04
updated: 2026-08-04
---

# T040 - Fix: hop-by-hop header stripping

## 目標
Fix `copyHeaders` (`internal/router/routing.go:419`) which copies all upstream headers verbatim, including hop-by-hop headers (`Connection`, `Keep-Alive`, `Upgrade`, `TE`, `Trailer`, `Transfer-Encoding`, `Proxy-*`). If upstream sends `Connection: close`, the client response is incorrect. Standard reverse-proxy hygiene: strip hop-by-hop headers before copying.

## 驗收標準
- [ ] `copyHeaders` skips hop-by-hop headers (case-insensitive)
- [ ] `Connection` header's named headers (e.g. `Connection: X-Foo` → also skip `X-Foo`) handled
- [ ] Unit test: src with `Connection`, `Keep-Alive`, `Transfer-Encoding`, normal headers → dst has only normal ones
- [ ] Proxy e2e tests still pass

## 備註
- Content-Length/Content-Encoding 不屬 hop-by-hop，保留（Go transport 已處理 gzip）
