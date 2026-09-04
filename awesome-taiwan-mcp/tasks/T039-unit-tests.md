---
github_issue: N/A
title: Unit Tests — >=80% coverage for critical modules
type: test
priority: high
status: pending
depends_on: [T038]
assignee: agent
created: 2026-09-05
updated: 2026-09-05
---

# T039 - Unit Tests — >=80% coverage for critical modules

## 目標

建立 unit tests for all modules. 對應 CRAWLER_AGENT_TASKS.md §30 TASK-039, §24 Testing Strategy。

## 驗收標準

- [ ] `go test ./... -- -cover` 執行成功, overall coverage >= 80%
- [ ] Critical modules coverage >= 90% (§80 KPI Verification):
  - `internal/classify/` (Taiwan scoring + LLM): coverage >= 90%
  - `internal/dedupe/` (identity + dedup): coverage >= 90%
  - `internal/verify/` (repository, endpoint, protocol, security): coverage >= 90%
  - `internal/scoring/` (quality): coverage >= 90%
  - `internal/storage/` (SQLite persistence): coverage >= 90%
- [ ] Unit tests for identity (§TST-024):
  - Repository URL normalization: trailing slash, .git → same ID
  - Different repos → different ID
  - Multi-source same repo → same ID
- [ ] Unit tests for dedup (§TST-022, §TST-023, §TST-024):
  - Cross-source deduplication: 5 sources → 1 server
  - Source aggregation: sources list not lost
  - Duplicate rate < 5%
- [ ] Unit tests for classification (§TST-009 ~ §TST-016):
  - T0: pure non-Taiwan MCP → score < 5
  - T1: only "Available for users in Taiwan" → T1 or ambiguous
  - T2: Taiwan language + compatible API → T2
  - T3: Taiwan-specific dataset → T3
  - T4: official Taiwan source → T4
  - T5: critical infrastructure → T5
  - Taiwan keyword detection: all mandatory keywords matched (§TST-009)
  - Taiwan domain detection: all required domains recognized (§TST-010)
  - Score determinism: 100 iterations → same score (§TST-018)
  - Evidence completeness: all scored rules have evidence (§TST-019)
- [ ] Unit tests for scoring (§TST-042, §TST-043):
  - All scores 0–100
  - Determinism: 100 iterations → unique(score)=1
- [ ] Unit tests for normalization:
  - URL normalization, name normalization, description normalization
  - Endpoint extraction, manifest parsing
- [ ] Unit tests for security (§TST-044, §TST-026):
  - Malicious fixture → findings with type, severity, source, location, evidence
  - process execution count = 0
- [ ] Unit tests for license detection (§TST-045):
  - MIT, Apache-2.0, GPL → exact match
  - No license → UNKNOWN (not guessed)
- [ ] Unit tests for repository status (§TST-046):
  - <90d → ACTIVE, 90-180d → MAINTENANCE, etc.
  - Archived → ARCHIVED (overrides time-based)

## 備註

- Testing strategy: Unit + Integration + E2E (§24)
- All tests must use mock servers and fixtures, NOT live Internet (§25)
- Branch coverage recommended >= 70% (§80)
