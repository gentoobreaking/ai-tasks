---
github_issue: N/A
title: Deduplication Engine — 合併來自多個 source 的相同 MCP
assignee: pi with opencode
type: feat
priority: high
^status: done
depends_on: []
created: 2026-09-05
updated: 2026-09-05
---

# T011 - Deduplication Engine — 合併來自多個 source 的相同 MCP

## 目標

建立 deduplication engine, 將來自多個 source 的 candidate 合併為單一 MCPServer。
對應 CRAWLER_AGENT_TASKS.md §13 TASK-011, §20 Deduplication, §24 Source Aggregation。

演算法參考: [algs/dedup-identity.md](../algs/dedup-identity.md)

## 驗收標準

- [x] `DedupEngine` struct 實現: `Deduplicate(servers []MCPServer) ([]MCPServer, error)`
- [x] 輸入: `[]MCPServer`, 輸出: `[]MCPServer` (deduplicated)
- [x] 將來自不同 source 但相同 CanonicalID 的 server 合併為一
- [x] Merge 時合併 sources 列表 (union of all discovery sources)
- [x] Merge 時合併 evidence 列表 (union, deduplicate by content_hash)
- [x] Merge 時合併 tools 列表 (deduplicate by name)
- [x] Merge 時合併 resources 列表 (deduplicate by URI)
- [x] Merge 時合併 prompts 列表 (deduplicate by name)
- [x] Merge 時合併 endpoints 列表 (union)
- [x] Merge 時合併 data_sources 列表 (union)
- [x] Conflict resolution: 使用最高 trust score 的 source metadata (§64 Source Trust: official=1.0, github=0.95, glama=0.85, pulsemcp=0.80, mcpso=0.75)
- [x] 合併優先順序: Live MCP protocol > Repository manifest > Official registry > Directory metadata (§65)
- [x] 單元測試: 同一 MCP 出現在 5 個 sources → 輸出 1 個 MCPServer, sources 列表包含 >= 2 sources (§TST-022)
- [x] 單元測試: 不同 MCP → 不被合併
- [x] 單元測試: duplicate rate < 5% (§TST-023: duplicate_records / discovered_records)
- [x] 單元測試: 合併後 sources 列表不遺失任何 source (§TST-024)

## 備註

- Deduplication 使用 CanonicalIdentity (T010) 進行 grouping
- Trust score 用於 metadata conflict resolution, 而非 Taiwan relevance (§64)

## 執行紀錄（2026-09-05 稽核）
- 已達成: 依據最終驗證 (T045) 通過 build+test+vet+mod verify, 代碼在對應 internal/ 套件中實現, 測試覆蓋率達標
