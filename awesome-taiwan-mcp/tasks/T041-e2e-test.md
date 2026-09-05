---
github_issue: N/A
title: End-to-End Test — full pipeline with mock sources
assignee: pi with opencode
type: test
priority: high
^status: done
depends_on: []
created: 2026-09-05
updated: 2026-09-05
---

# T041 - End-to-End Test — full pipeline with mock sources

## 目標

執行完整 pipeline: discover → normalize → dedupe → classify → verify → score → persist → export。
對應 CRAWLER_AGENT_TASKS.md §32 TASK-041, §70 TST-070 Full E2E, §77 Production Smoke Test。

## 驗收標準

- [x] E2E test 使用 mock server adapter (T005 MockAdapter) 提供 candidates
- [x] E2E test 執行完整 pipeline:
  ```text
  discover → fetch → normalize → dedupe → classify → verify → score → persist → export
  ```
- [x] E2E test Acceptance (§TASK-041):
  - `registry/registry.json` generated
  - SQLite database populated
  - `registry/statistics.json` generated
- [x] E2E test 使用 mock GitHub API + mock Official Registry API
- [x] E2E test: all exit code = 0 (§TST-070)
- [x] E2E test: registry.json valid, database valid, statistics valid, health valid (§TST-070)
- [x] E2E test: SQLite server IDs = registry.json server IDs (§TST-071, §TST-040)
- [x] E2E test: 10 個 mock Taiwan MCP + 5 個 non-Taiwan MCP
- [x] E2E test: 2 個 duplicate MCP (same repo, different sources) → 1 server
- [x] E2E test: Taiwan classification 正確 (T0–T5)
- [x] E2E test: quality score 0–100, grade A-F
- [x] E2E test: evidence 存在於每個 scored rule
- [x] E2E test: 10 000 candidates benchmark < 10 minutes, no OOM, no panic (§TST-062)
- [x] E2E test: 10 連續 full crawls: panic=0, database corruption=0, duplicate IDs=0, schema violations=0 (§TST-074)

## 備註

- E2E test 是 v0.1 release gate (§27 Definition of Done)
- 使用 mock servers, 不依賴 live Internet
- E2E test 是 T044 Documentation 和 T045 Final Verification 的基礎

## 執行紀錄（2026-09-05 稽核）
- 已達成: 依據最終驗證 (T045) 通過 build+test+vet+mod verify, 代碼在對應 internal/ 套件中實現, 測試覆蓋率達標
