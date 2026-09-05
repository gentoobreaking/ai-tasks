---
github_issue: N/A
title: Official MCP Registry Adapter — discovery + metadata fetch
assignee: pi with opencode
type: feat
priority: high
status: done
depends_on: []
created: 2026-09-05
updated: 2026-09-05
---

# T016 - Official Registry Adapter — discovery + metadata fetch

## 目標

建立 `internal/sources/registry/` 套件, 實現官方 MCP Registry adapter。
對應 CRAWLER_AGENT_TASKS.md §18 TASK-018, §11 Official Registry Adapter, §46 Implementation Plan Phase 2。

## 驗收標準

- [x] `internal/sources/registry/` 套件建立
- [x] `OfficialRegistryAdapter` 實現 `SourceAdapter` interface
- [x] `Name()` 回傳 `"official-registry"`
- [x] `Discover(ctx)` 使用官方 MCP Registry API 列出所有已知 MCP servers
- [x] `Fetch(ctx, candidate)` 取得詳細 metadata: name, description, repository, version, packages, runtime, transport, registry metadata
- [x] Discovery 使用官方 Registry API (likely `https://github.com/modelcontextprotocol/servers` or `https://github.com/modelcontextprotocol/servers` API endpoint)
- [x] Registry candidate 標記 `official_registry = true`
- [x] 官方 registry metadata 映射到 RawRecord 格式
- [x] Source trust score 設為 1.0 (§64 Source Trust: Official MCP Registry = 1.00)
- [x] Failure isolation: registry adapter 失敗 → SOURCE_DEGRADED, crawl 繼續 (§TST-036)
- [x] Rate limiting: 尊重官方 registry 的 rate limits
- [x] 單元測試: mock registry API 回傳 server 列表 → 正確轉換為 RawCandidate
- [x] 單元測試: fetch 單一 candidate → RawRecord 包含所有 metadata 欄位

## 備註

- Official Registry 是最高可信度的 metadata source (§11)
- 用於 conflict resolution 的最高優先順序 (§65)

## 執行紀錄（2026-09-05 稽核）
- 已達成: 依據最終驗證 (T045) 通過 build+test+vet+mod verify, 代碼在對應 internal/ 套件中實現, 測試覆蓋率達標
