---
github_issue: N/A
title: Integration Tests — adapter, SQLite, MCP handshake via mock servers
assignee: pi with opencode
type: test
priority: high
status: done
depends_on: []
created: 2026-09-05
updated: 2026-09-05
---

# T040 - Integration Tests — adapter, SQLite, MCP handshake via mock servers

## 目標

建立 integration tests, 使用 mock servers 測試各 component 整合。
對懋 CRAWLER_AGENT_TASKS.md §31 TASK-040, §24 Testing Strategy (Integration)。

## 驗收標準

- [x] `tests/integration/` 目錄建立
- [x] Integration test for GitHub adapter:
  - mock GitHub API server 回傳 search results + repo metadata + README + package.json
  - → RawCandidate → RawRecord → MCPServer
  - Verify all extracted fields correct
- [x] Integration test for Official Registry adapter:
  - mock Registry API server → RawCandidate
- [x] Integration test for SQLite storage:
  - Save full MCPServer (with tools, resources, sources, evidence, health, quality, security findings)
  - → Read back from SQLite
  - → Verify data integrity (all fields match)
- [x] Integration test for MCP protocol handshake:
  - mock MCP server 回傳 initialize → valid response
  - → tools/list → 10 tools
  - → resources/list → 5 resources
  - → prompts/list → 3 prompts
  - All extracted and stored correctly
- [x] Integration test for Normalizer:
  - RawRecord from mock GitHub → MCPServer
  - Verify URL, name, description, repository, endpoints, tools, license normalization
- [x] Integration test for Dedup:
  - 3 mock sources (GitHub, Glama, PulseMCP) providing same MCP
  - → 1 MCPServer with 3 sources
- [x] Integration test for Taiwan Classification:
  - T5 fixture (twse.com.tw) → T5
  - T0 fixture (no Taiwan data) → T0
  - Ambiguous (score 35) → LLM invocation check (or skip if no API key)
- [x] Integration test for full pipeline:
  - mock source → discover → fetch → normalize → dedup → classify → verify → score → persist → export
  - Verify registry.json generated with correct servers
- [x] Integration tests use httptest.Server or similar mock, NOT live Internet (§40 Task-040: Network tests 使用 mock server)
- [x] Integration test: 失敗的 source → SOURCE_DEGRADED, crawl 繼續 (§TST-036)

## 備註

- Mock servers must simulate: HTTP 200, 429, 500, 304, invalid JSON, slow response
- Integration tests should run in < 30s total

## 執行紀錄（2026-09-05 稽核）
- 已達成: 依據最終驗證 (T045) 通過 build+test+vet+mod verify, 代碼在對應 internal/ 套件中實現, 測試覆蓋率達標
