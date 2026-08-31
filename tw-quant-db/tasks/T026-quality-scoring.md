---
id: T026
project: tw-quant-db
assignee: "pi"
priority: high
type: implementation
status: done
depends_on: [T021]
github_issue: https://github.com/gentoobreaking/ai-tasks/issues/65
created: 2026-08-31
updated: 2026-08-31
---

# T026 - Quality Scoring + Coverage Score

## 目標
實作 spec §5.2 的 Data Completeness Scoring 和 §5.4 Quality-Based Selection Algorithm。

## 驗收標準
- [x] `fetchWithQuality` computes `coverage_score = returned_dates_count / requested_dates_count`
- [x] `score = source_weight × availability × coverage_score` (spec §5.4)
- [x] `sourceQuality` map: local-mcp=1.0, twse-mcp=0.9, finmind-mcp=0.7, yfinance-mcp=0.5
- [x] If `coverage_score < 0.7`, mark as incomplete and trigger fallback
- [x] Logging records coverage score and source selection

## 備註
- spec §5.3: If `IncompleteData` (>30% missing) → Switch to next source immediately
- source_weight 與 sourceQuality 為相同概念，單位為小數 (0-1)
