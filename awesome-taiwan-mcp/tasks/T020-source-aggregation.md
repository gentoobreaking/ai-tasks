---
github_issue: N/A
title: Source Aggregation — 合併多個 source 的 metadata
type: feat
priority: high
status: pending
depends_on: [T011]
assignee: agent
created: 2026-09-05
updated: 2026-09-05
---

# T020 - Source Aggregation — 合併多個 source 的 metadata

## 目標

實現 source aggregation 邏輯, 將來自多個 source 的相同 MCP 合併。
對應 CRAWLER_AGENT_TASKS.md §14 TASK-020, §24 Source Aggregation, §65 Conflict Resolution。

## 驗收標準

- [ ] `AggregateSources(servers []MCPServer) []MCPServer` 函數實現
- [ ] 同一 MCP 在 GitHub + Glama + PulseMCP → 合併為 1 個 MCPServer (§24)
- [ ] 合併後 sources 列表包含所有 discovery sources: `[{"source": "github", "url": "..."}, {"source": "glama", "url": "..."}, {"source": "pulsemcp", "url": "..."}]`
- [ ] Conflict resolution 優先順序 (§65): Live MCP protocol > Repository manifest > Official registry > Directory metadata
- [ ] Trust score 用於 metadata conflict resolution (§64): Official=1.00, GitHub=0.95, Glama=0.85, PulseMCP=0.80, MCP.so=0.75
- [ ] Trust score 不用于 Taiwan relevance (§64: "不是用於 Taiwan relevance")
- [ ] 單元測試: 同一 server 同時在 GitHub + Glama + PulseMCP → registry 包含所有 3 個 sources, 資料不遺失 (§TST-024)

## 備註

- Source aggregation 是 dedup engine (T011) 的一部分
- Sources 關係存儲在 server_sources table (T004)
- 每個 source 記錄 trust_score 用於 conflict resolution
