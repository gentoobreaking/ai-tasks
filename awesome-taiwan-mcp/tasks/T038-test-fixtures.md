---
github_issue: N/A
title: Test Fixtures — taiwan, non-taiwan, duplicate, archived, dead endpoint, invalid, official, scraping
type: test
priority: high
status: pending
depends_on: [T002, T003]
assignee: agent
created: 2026-09-05
updated: 2026-09-05
---

# T038 - Test Fixtures — taiwan, non-taiwan, duplicate, archived, dead endpoint, invalid, official, scraping

## 目標

建立 `tests/fixtures/` 目錄, 包含所有測試所需的固定資料。
對應 CRAWLER_AGENT_TASKS.md §28 TASK-038, §25 CRAWLER_IMPLEMENTATION_PLAN Test Fixtures。

## 驗收標準

- [ ] `tests/fixtures/` 目錄建立
- [ ] `tests/fixtures/github/` 建立: GitHub API response fixtures (search results + repo metadata)
- [ ] `tests/fixtures/glama/` 建立: Glama API response fixtures
- [ ] `tests/fixtures/pulsemcp/` 建立: PulseMCP API response fixtures
- [ ] `tests/fixtures/mcpso/` 建立: MCP.so API response fixtures
- [ ] `tests/fixtures/registry/` 建立: Official Registry API response fixtures
- [ ] `tests/fixtures/taiwan/` 建立: 台灣 MCP fixtures (至少 3 個):
  - T5: TWSE MCP (official domain twse.com.tw, government API, finance)
  - T4: FinMind MCP (data.gov.tw mention, financial API)
  - T3: mcp-tw-lvr (台灣房價, 實價登錄, 語言 Traditional Chinese)
- [ ] `tests/fixtures/non-taiwan/` 建立: 非台灣 MCP fixtures (至少 3 個, score < 5 → T0)
- [ ] `tests/fixtures/duplicate/` 建立: 相同 MCP 在多個 source 的 fixtures (at least 2 sources)
- [ ] `tests/fixtures/archived/` 建立: archived GitHub repo fixture
- [ ] `tests/fixtures/dead-endpoint/` 建立: MCP endpoint unreachable fixture
- [ ] `tests/fixtures/invalid/` 建立: invalid MCP (bad manifest, invalid JSON)
- [ ] `tests/fixtures/official/` 建立: official Taiwan API MCP fixture
- [ ] `tests/fixtures/scraping/` 建立: web scraping MCP fixture
- [ ] 所有 fixture 必須固定 (deterministic), 不依賴 live Internet (§25 Implementation Plan)
- [ ] `tests/fixtures/schema/` 建立: valid.json, invalid.json, missing-required.json, invalid-enum.json (for T003 schema validation)
- [ ] `tests/fixtures/golden/` 建立: 100 Taiwan, 100 non-Taiwan, 50 duplicate, 30 ambiguous, 20 invalid, 20 archived, 20 unavailable (§TST-068 Golden Dataset)
- [ ] 每個 fixture 包含: source API response, expected RawCandidate, expected MCPServer, expected Taiwan score, expected level

## 備註

- Fixtures 必須 mock 所有的 network responses, 不依賴 live API (§25, §TST-060)
- Golden dataset 用於 regression testing (§TST-068, §TST-069)
- Fixture 格式: JSON files with deterministic data
