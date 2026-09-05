---
github_issue: N/A
title: Capability Search — tool/resource/data-source capability matching
assignee: pi with opencode
type: feat
priority: medium
^status: done
depends_on: []
created: 2026-09-05
updated: 2026-09-05
---

# T037 - Capability Search — tool/resource/data-source capability matching

## 目標

支援 capability-based search: find MCP capable of specific Taiwan functions。
對應 CRAWLER_AGENT_TASKS.md §37 TASK-037, §22 Capability Search (Registry Schema)§。

## 驗收標準

- [x] `CapabilitySearcher` struct 實現: `SearchByCapability(query string) ([]MCPServer, error)`
- [x] Search 處理流程 (§22):
  ```text
  query → category match → tool capability match → data source match → Taiwan relevance → health → quality
  ```
- [x] Tool capability match: match query keywords in tool name + description + input_schema
- [x] Resource capability match: match query keywords in resource URI + name + description
- [x] Data source match: match query against known Taiwan data sources (TWSE, CWA, etc.)
- [x] Category match: map query to category (e.g. "stock price" → "finance" + "stock")
- [x] Query examples: "Taiwan stock price", "Taiwan real estate", "Taiwan weather", "Legislative Yuan", "government open data"
- [x] Result ranking: 依 capability match 強度 + Taiwan relevance + health + quality 排序
- [x] 單元測試: query="Taiwan stock price" → server-A (tool=get_stock_price) appears in result (§TST-058)
- [x] 單元測試: tool capability match = true for matched servers (§TST-058)
- [x] 單元測試: ranking 符合 capability + Taiwan relevance + health + quality (§TST-059)

## 備註

- Capability search 是 Registry 的核心價值 (§53): 不是找到最多, 而是找到可信可驗證的 Taiwan MCP
- Query → category mapping for Taiwan-specific queries:
  - "stock price" → finance + stock
  - "real estate" → real-estate + government
  - "weather" → weather
  - "government" → government + open-data

## 執行紀錄（2026-09-05 稽核）
- 已達成: 依據最終驗證 (T045) 通過 build+test+vet+mod verify, 代碼在對應 internal/ 套件中實現, 測試覆蓋率達標
