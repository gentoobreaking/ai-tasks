---
github_issue: N/A
title: > ⛔ MCP.so Adapter — discovery + metadata fetch (Phase 2, needs MCP.so API)
type: feat
priority: low
status: pending
depends_on: [T005]
blocked_on:
- "MCP.so API access available (Phase 2 completion, see §67 MVP Scope Phase 2)"
assignee: agent
created: 2026-09-05
updated: 2026-09-05
---

# T019 - > ⛔ MCP.so Adapter — discovery + metadata fetch (Phase 2, needs MCP.so API)

## 目標

建立 `internal/sources/mcpso/` 套件, 實現 MCP.so adapter。
對應 CRAWLER_AGENT_TASKS.md §21 TASK-021, §10 MCP.so Adapter, §67 MVP Scope Phase 2。

> ⛔ 本任務受外部條件約束：blocked_on 全數滿足前不得開工。排程器挑到時應先逐項驗條件，未滿足則跳過並記錄原因。

## 驗收標準

- [ ] `internal/sources/mcpso/` 套件建立
- [ ] `MCPSoAdapter` 實現 `SourceAdapter` interface
- [ ] `Name()` 回傳 `"mcpso"`
- [ ] MCP.so 作為: Discovery, Metadata, Remote MCP Endpoint (§10)
- [ ] 特別處理: server URL, GitHub URL, npm package, Docker image, remote endpoint
- [ ] Source trust score 設為 0.75 (§64)
- [ ] Failure isolation: mcpso fail → SOURCE_DEGRADED (§41)
- [ ] Rate limiting + retry (§40, §22)
- [ ] 單元測試: mock MCP.so API → RawCandidate

## 備註

- v0.1 不包含 (§67 MVP Scope)
- Phase 2 添加 (§67 MVP Scope Phase 2)
- blocked_on: "MCP.so API access available"
