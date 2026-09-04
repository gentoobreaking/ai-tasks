---
github_issue: N/A
title: Taiwan Scoring — deterministic relevance score + level mapping
type: feat
priority: high
^status: done
depends_on: [T012, T013]
assignee: agent
created: 2026-09-05
updated: 2026-09-05
---

# T014 - Taiwan Scoring — deterministic relevance score + level mapping

## 目標

建立 deterministic Taiwan relevance scoring engine。
對應 CRAWLER_AGENT_TASKS.md §16 TASK-014, §17 Deterministic Relevance Score, §14 Taiwan Relevance。

演算法參考: [algs/taiwan-classification.md](../algs/taiwan-classification.md)

## 驗收標準

- [ ] `internal/classify/rules.go` 中實現 `Score(server MCPServer) TaiwanRelevance` 函數
- [ ] Scoring rules 實現 (§17):
  - official Taiwan domain match: +40 (evidence type=official_domain)
  - Taiwan government API detected: +40 (evidence type=official_gov_api)
  - Taiwan financial API detected: +35 (evidence type=taiwan_financial_api)
  - Taiwan-specific dataset detected: +30 (evidence type=taiwan_dataset)
  - Taiwan-specific keyword found: +20 (evidence type=repository_keyword)
  - Taiwan language detected: +15 (evidence type=taiwan_language)
  - Taiwan company/service detected: +15 (evidence type=taiwan_company)
  - README Taiwan mention: +5 (evidence type=readme_mention)
- [ ] Level mapping (§17):
  - score >= 70 → T5
  - score >= 55 → T4
  - score >= 40 → T3
  - score >= 20 → T2
  - score >= 5 → T1
  - score < 5 → T0
- [ ] 每個 scoring rule 必須產生對應 evidence 記錄 (§16): type, source, location, matched_value, score, timestamp, content_hash
- [ ] Confidence 設為 1.0 (deterministic scoring)
- [ ] `thresholdToLevel(score float64) string` 輔助函數實現
- [ ] 單元測試: 给定 fixture 與 expected score → actual_score == expected_score (§TST-017, 不是 range)
- [ ] 單元測試: 100 iterations 執行相同 input → unique(scores)=1, unique(classification)=1 (§TST-018)
- [ ] 單元測試: 100% scored rules have corresponding evidence (§TST-019)
- [ ] 單元測試: T0 分類 → score < 5; T5 分類 → score >= 70

## 備註

- 所有 scoring 必須 deterministic (§2.2 Deterministic First)
- LLM 不得取代 deterministic logic (§CRAWLER_AGENT_TASKS Rule 10)
- Evidence completeness 是 P1 (§16, §TST-019)
