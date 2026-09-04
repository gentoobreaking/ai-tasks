---
github_issue: N/A
title: Quality Engine — 10-component 100-point scoring
type: feat
priority: high
^status: done
depends_on: [T002, T024, T023]
assignee: agent
created: 2026-09-05
updated: 2026-09-05
---

# T025 - Quality Engine — 10-component 100-point scoring

## 目標

建立 `internal/scoring/` 套件, 實現 10-component quality scoring engine。
對應 CRAWLER_AGENT_TASKS.md §27 TASK-027, §31 Quality Score, §32 Data Source Score。

演算法參考: [algs/quality-scoring.md](../algs/quality-scoring.md)

## 驗收標準

- [ ] `internal/scoring/` 套件建立
- [ ] `QualityScorer` struct 實現: `Score(server *MCPServer) QualityScore`
- [ ] 10 個 scoring components 實現 (§31):
  - Data Source (max 20): Official Taiwan API=20, Government OpenData=18, Official company API=15, Known third-party API=10, Web scraping=7, Unknown=0
  - Maintenance (max 15): last commit < 90d=15, 90-180d=12, 180-365d=8, >365d=3
  - Documentation (max 10): README exists + >200 chars=5, setup instructions=3, examples=2
  - MCP Compliance (max 15): has MCP manifest=5, stdio transport=3, HTTP transport=3, SSE transport=2, streamable-http=2
  - Tool Schema (max 10): tools/list successful=3, >=1 tool with name+desc=3, >=1 tool with input_schema=2, >=5 tools total=2
  - Health (max 10): HEALTHY=10, DEGRADED=5, UNAVAILABLE=0, INVALID=0, UNKNOWN=0
  - Repository (max 5): repo exists=3, stars>=10=1, stars>=100=1
  - License (max 5): license detected=3, permissive license (MIT/Apache/BSD)=2, no license=0
  - Security (max 5): no findings=5, LOW=-0.5, MEDIUM=-1, HIGH=-3, CRITICAL=-5 (min 0)
  - Community (max 5): stars>=10=1, stars>=50=1, stars>=100=1, forks>=5=1, has topics=1
- [ ] 總分 = sum of all components, 範圍 0–100
- [ ] Grade mapping: >=90=A, >=80=B, >=70=C, >=60=D, <60=F
- [ ] QualityScore struct 實現 (§15): Score (int 0-100), Grade (A-F), Components (struct of all 10)
- [ ] Score 保存到 SQLite quality_scores 表
- [ ] Score 保存到 MCPServer.Quality
- [ ] 單元測試: 所有 MCP score 0 <= score <= 100, invalid score count = 0 (§TST-042)
- [ ] 單元測試: 100 iterations, unique(score)=1 (§TST-043)

## 備註

- Quality scoring 必須 deterministic (§21 Retry Policy — deterministic)
- LLM 不得影響 quality scoring
- Security score 不能為負, minimum 0
