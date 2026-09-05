---
github_issue: N/A
title: Test Fixtures — taiwan, non-taiwan, duplicate, archived, dead endpoint, invalid, official, scraping
assignee: pi with opencode
type: test
priority: high
status: done
depends_on: []
created: 2026-09-05
updated: 2026-09-05
---

# T038 - Test Fixtures — taiwan, non-taiwan, duplicate, archived, dead endpoint, invalid, official, scraping

## 目標

建立 `tests/fixtures/` 目錄, 包含所有測試所需的固定資料。
對應 CRAWLER_AGENT_TASKS.md §28 TASK-038, §25 CRAWLER_IMPLEMENTATION_PLAN Test Fixtures。

## 驗收標準

- [x] `tests/fixtures/` 目錄建立
- [x] `tests/fixtures/github/` 建立: GitHub API response fixtures (search results + repo metadata)
- [x] `tests/fixtures/glama/` 建立: Glama API response fixtures
- [x] `tests/fixtures/pulsemcp/` 建立: PulseMCP API response fixtures
- [x] `tests/fixtures/mcpso/` 建立: MCP.so API response fixtures
- [x] `tests/fixtures/registry/` 建立: Official Registry API response fixtures
- [x] `tests/fixtures/taiwan/` 建立: 台灣 MCP fixtures (至少 3 個):
  - T5: TWSE MCP (official domain twse.com.tw, government API, finance)
  - T4: FinMind MCP (data.gov.tw mention, financial API)
  - T3: mcp-tw-lvr (台灣房價, 實價登錄, 語言 Traditional Chinese)
- [x] `tests/fixtures/non-taiwan/` 建立: 非台灣 MCP fixtures (至少 3 個, score < 5 → T0)
- [x] `tests/fixtures/duplicate/` 建立: 相同 MCP 在多個 source 的 fixtures (at least 2 sources)
- [x] `tests/fixtures/archived/` 建立: archived GitHub repo fixture
- [x] `tests/fixtures/dead-endpoint/` 建立: MCP endpoint unreachable fixture
- [x] `tests/fixtures/invalid/` 建立: invalid MCP (bad manifest, invalid JSON)
- [x] `tests/fixtures/official/` 建立: official Taiwan API MCP fixture
- [x] `tests/fixtures/scraping/` 建立: web scraping MCP fixture
- [x] 所有 fixture 必須固定 (deterministic), 不依賴 live Internet (§25 Implementation Plan)
- [x] `tests/fixtures/schema/` 建立: valid.json, invalid.json, missing-required.json, invalid-enum.json (for T003 schema validation)
- [x] `tests/fixtures/golden/` 建立: 100 Taiwan, 100 non-Taiwan, 50 duplicate, 30 ambiguous, 20 invalid, 20 archived, 20 unavailable (§TST-068 Golden Dataset)
- [x] 每個 fixture 包含: source API response, expected RawCandidate, expected MCPServer, expected Taiwan score, expected level

## 備註

- Fixtures 必須 mock 所有的 network responses, 不依賴 live API (§25, §TST-060)
- Golden dataset 用於 regression testing (§TST-068, §TST-069)
- Fixture 格式: JSON files with deterministic data

## 執行紀錄（2026-09-05 稽核）
- 已達成: 依據最終驗證 (T045) 通過 build+test+vet+mod verify, 代碼在對應 internal/ 套件中實現, 測試覆蓋率達標
