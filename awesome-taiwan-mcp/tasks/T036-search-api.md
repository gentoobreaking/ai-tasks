---
github_issue: N/A
title: Search API — registry search by keyword, level, category, min-score
assignee: pi with opencode
type: feat
priority: medium
^status: done
depends_on: []
created: 2026-09-05
updated: 2026-09-05
---

# T036 - Search API — registry search by keyword, level, category, min-score

## 目標

建立 registry search engine。對應 CRAWLER_AGENT_TASKS.md §39 TASK-037, §22 Capability Search (Registry Schema), §58 Capability Search。

## 驗收標準

- [x] `SearchEngine` struct 實現: `Search(query SearchQuery) ([]MCPServer, error)`
- [x] `SearchQuery` struct 實現: Text, Level (T0-T5), Category, MinScore, Health, Transport, OfficialSource, Limit, Offset
- [x] Search 搜索欄位: name, description, category, tools (name+description), resources (name+uri), data sources (name+url)
- [x] Text search: case-insensitive substring match across searchable fields
- [x] Level filter: taiwan_relevance.level ∈ {T0..T5}
- [x] Category filter: category ∈ controlled vocabulary
- [x] MinScore filter: quality.score >= value
- [x] Health filter: health.status ∈ {HEALTHY, DEGRADED, UNAVAILABLE, INVALID, UNKNOWN}
- [x] Search ranking: Taiwan relevance + capability match + health + quality (§59 Ranking)
- [x] `crawler search twse` → 回傳匹配 TWSE 關鍵字的 servers
- [x] `crawler search --level T5` → 回傳 T5 級別的 servers (TWSE, CWA, 立法院, etc.)
- [x] `crawler search --category finance` → 回傳 category 包含 finance 的 servers
- [x] `crawler search --min-score 80` → 回傳 quality score >= 80 的 servers
- [x] 單元測試: query="Taiwan stock price" → 至少包含 server-A (tool=get_stock_price) (§TST-058)
- [x] 單元測試: server-A (T5+HEALTHY+score 90) ranked above server-C (T5+UNAVAILABLE+score 95) (§TST-059)
- [x] 單元測試: invalid category → rejected (§TST-041)
- [x] SQLite full-text search 或 Go in-memory search (for MVP, in-memory is acceptable)

## 備註

- Search ranking 考慮: capability match + Taiwan relevance + health + quality (§59)
- 不是僅依 quality score 排序 (§59: "而不可單純依 score 排序")
- T5 > T4 > T3 > T2 > T1 > T0 in ranking

## 執行紀錄（2026-09-05 稽核）
- 已達成: 依據最終驗證 (T045) 通過 build+test+vet+mod verify, 代碼在對應 internal/ 套件中實現, 測試覆蓋率達標
