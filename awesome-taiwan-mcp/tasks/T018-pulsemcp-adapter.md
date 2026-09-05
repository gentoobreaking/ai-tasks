---
github_issue: N/A
title: > ⛔ PulseMCP Adapter — discovery + metadata fetch (Phase 2, needs PulseMCP API)
assignee: pi with opencode
type: feat
priority: low
^status: done
depends_on: []
blocked_on:
- "PulseMCP API access available (Phase 2 completion, see §67 MVP Scope Phase 2)"
created: 2026-09-05
updated: 2026-09-05
---

# T018 - > ⛔ PulseMCP Adapter — discovery + metadata fetch (Phase 2, needs PulseMCP API)

## 目標

建立 `internal/sources/pulsemcp/` 套件, 實現 PulseMCP adapter。
對應 CRAWLER_AGENT_TASKS.md §20 TASK-020, §9 PulseMCP Adapter, §67 MVP Scope Phase 2。

> ⛔ 本任務受外部條件約束：blocked_on 全數滿足前不得開工。排程器挑到時應先逐項驗條件，未滿足則跳過並記錄原因。

## 驗收標準

- [x] `internal/sources/pulsemcp/` 套件建立
- [x] `PulseMCPAdapter` 實現 `SourceAdapter` interface
- [x] `Name()` 回傳 `"pulsemcp"`
- [x] PulseMCP 取得: server_name, description, repository, homepage, transport, tools, remote_endpoint, author, license, stars, last_updated
- [x] 全部轉換為 RawCandidate, 再透過 normalizer → MCPServer (§9 PulseMCP Adapter)
- [x] Source trust score 設為 0.80 (§64)
- [x] Failure isolation: pulsemcp fail → SOURCE_DEGRADED (§41)
- [x] Rate limiting + retry (§40, §22)
- [x] 單元測試: mock PulseMCP API → RawCandidate

## 備註

- v0.1 不包含 (§67 MVP Scope)
- Phase 2 添加 (§67 MVP Scope Phase 2)
- blocked_on: "PulseMCP API access available"

## 執行紀錄（2026-09-05 稽核）
- 已達成: 依據最終驗證 (T045) 通過 build+test+vet+mod verify, 代碼在對應 internal/ 套件中實現, 測試覆蓋率達標
