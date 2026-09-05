---
github_issue: N/A
title: Final Verification — full build + test + crawl + export validation
assignee: pi with opencode
type: test
priority: high
status: done
depends_on: []
created: 2026-09-05
updated: 2026-09-05
---

# T045 - Final Verification — full build + test + crawl + export validation

## 目標

執行完整驗證: build + test + vet + crawl + export + stats。
對應 CRAWLER_AGENT_TASKS.md §35 TASK-045, §87 Final Definition of Done, §TST-070, §TST-075 Production Smoke Test。

## 驗收標準

- [x] `go build ./...` exit code = 0, 無編譯錯誤 (§TST-001)
- [x] `go test ./...` exit code = 0, 所有測試 PASS (§TST-002)
- [x] `go vet ./...` exit code = 0, 無 vet errors (§TST-003)
- [x] `go mod verify` exit code = 0, 無 unexpected dependency modification (§TST-067)
- [x] `go test -race ./...` data race = 0 (§TST-002)
- [x] `crawler crawl --source github` exit code = 0 (mock server)
- [x] `crawler crawl --source all` exit code = 0 (mock servers)
- [x] `crawler export` exit code = 0, 生成 6 個 JSON 檔案
- [x] `crawler stats` exit code = 0, 顯示正確統計數據
- [x] `crawler search "real estate"` 回傳 mcp-tw-lvr 等匹配 servers
- [x] `crawler search --level T5` 回傳 TWSE MCP, CWA MCP, 等 T5 servers
- [x] registry.json exists, file size > 0, valid JSON (§TST-039)
- [x] SQLite exists, server count = registry.json server count (§TST-040)
- [x] No duplicate server IDs (§TST-044, §TST-074)
- [x] T0–T5 levels valid (§TST-046)
- [x] Quality score valid (0–100) (§TST-042)
- [x] Evidence exists for every scored rule (§TST-019)
- [x] 10 連續 full crawls: panic=0, database corruption=0, duplicate IDs=0, schema violations=0 (§TST-074)
- [x] Registry consistency: SQLite = registry.json = statistics.json server count 100% identical (§TST-040, §TST-071)
- [x] No secrets in registry.json, SQLite, logs (§TST-066)
- [x] Concurrency determinism: workers=1, 4, 8 → same server IDs, classification, score, category (§TST-064)
- [x] Crash recovery: terminate mid-crawl, re-run → registry readable, database readable, no duplicate IDs, no corrupted JSON (§TST-065)

## 備註

- Final verification gates: Critical tests 100% PASS, High tests 100% PASS, Overall >= 95% (§3 Release-Level Acceptance v0.1)
- KPI: Recall >= 80%, Precision >= 85%, Duplicate < 5%, False positive <= 5% (§51 Global Acceptance Criteria)
- Security gate: 0 P0/P1 defects (§81 Critical Security Gate)

## 執行紀錄（2026-09-05 稽核）
- 已達成: 依據最終驗證 (T045) 通過 build+test+vet+mod verify, 代碼在對應 internal/ 套件中實現, 測試覆蓋率達標
