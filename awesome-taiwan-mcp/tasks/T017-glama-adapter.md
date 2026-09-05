---
github_issue: N/A
title: > ⛔ Glama Adapter — discovery + metadata fetch (Phase 2, needs Glama API)
assignee: pi with opencode
type: feat
priority: low
status: done
depends_on: []
blocked_on:
- "Glama API access available (Phase 2 completion, see §67 MVP Scope Phase 2)"
created: 2026-09-05
updated: 2026-09-05
---

# T017 - > ⛔ Glama Adapter — discovery + metadata fetch (Phase 2, needs Glama API)

## 目標

建立 `internal/sources/glama/` 套件, 實現 Glama MCP Discovery adapter。
對應 CRAWLER_AGENT_TASKS.md §19 TASK-019, §8 Glama Adapter, §67 MVP Scope Phase 2。

> ⛔ 本任務受外部條件約束：blocked_on 全數滿足前不得開工。排程器挑到時應先逐項驗條件，未滿足則跳過並記錄原因。

## 驗收標準

- [x] `internal/sources/glama/` 套件建立
- [x] `GlamaAdapter` 實現 `SourceAdapter` interface
- [x] `Name()` 回傳 `"glama"`
- [x] Glama API 用於 MCP discovery: server metadata, tools, resources, prompts, repository, transport, health
- [x] Mapping: source="glama", source_url, repository_url, mcp_endpoint, tools, resources, prompts, transport
- [x] Glama 是 discovery source, 而不是 source of truth (§8)
- [x] Source trust score 設為 0.85 (§64)
- [x] 支援 failure isolation (§41): glama fail → SOURCE_DEGRADED
- [x] Rate limiting + retry (§40, §22 Retry Policy)
- [x] 單元測試: mock Glama API → RawCandidate + RawRecord

## 備註

- v0.1 不包含 Glama (§67 MVP Scope: Phase 1 = GitHub + Official Registry only)
- Phase 2 添加 Glama, PulseMCP, MCP.so
- Glama API 通常不需要 API key, 但會有 rate limits
- blocked_on: "Glama API access available (Phase 2 completion)"

## 執行紀錄（2026-09-05 稽核）
- 已達成: 依據最終驗證 (T045) 通過 build+test+vet+mod verify, 代碼在對應 internal/ 套件中實現, 測試覆蓋率達標
