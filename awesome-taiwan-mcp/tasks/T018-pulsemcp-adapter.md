---
github_issue: N/A
title: > ⛔ PulseMCP Adapter — discovery + metadata fetch (Phase 2, needs PulseMCP API)
type: feat
priority: low
status: pending
depends_on: [T005]
blocked_on:
- "PulseMCP API access available (Phase 2 completion, see §67 MVP Scope Phase 2)"
assignee: agent
created: 2026-09-05
updated: 2026-09-05
---

# T018 - > ⛔ PulseMCP Adapter — discovery + metadata fetch (Phase 2, needs PulseMCP API)

## 目標

建立 `internal/sources/pulsemcp/` 套件, 實現 PulseMCP adapter。
對應 CRAWLER_AGENT_TASKS.md §20 TASK-020, §9 PulseMCP Adapter, §67 MVP Scope Phase 2。

> ⛔ 本任務受外部條件約束：blocked_on 全數滿足前不得開工。排程器挑到時應先逐項驗條件，未滿足則跳過並記錄原因。

## 驗收標準

- [ ] `internal/sources/pulsemcp/` 套件建立
- [ ] `PulseMCPAdapter` 實現 `SourceAdapter` interface
- [ ] `Name()` 回傳 `"pulsemcp"`
- [ ] PulseMCP 取得: server_name, description, repository, homepage, transport, tools, remote_endpoint, author, license, stars, last_updated
- [ ] 全部轉換為 RawCandidate, 再透過 normalizer → MCPServer (§9 PulseMCP Adapter)
- [ ] Source trust score 設為 0.80 (§64)
- [ ] Failure isolation: pulsemcp fail → SOURCE_DEGRADED (§41)
- [ ] Rate limiting + retry (§40, §22)
- [ ] 單元測試: mock PulseMCP API → RawCandidate

## 備註

- v0.1 不包含 (§67 MVP Scope)
- Phase 2 添加 (§67 MVP Scope Phase 2)
- blocked_on: "PulseMCP API access available"
