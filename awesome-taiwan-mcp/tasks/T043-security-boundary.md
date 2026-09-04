---
github_issue: N/A
title: Security Boundary — enforce never-execute-discovered-code policy
type: security
priority: high
status: pending
depends_on: [T006, T009, T026]
assignee: agent
created: 2026-09-05
updated: 2026-09-05
---

# T043 - Security Boundary — enforce never-execute-discovered-code policy

## 目標

確認 crawler 絕對不能執行任何 discovered MCP code。
對應 CRAWLER_AGENT_TASKS.md §33 TASK-043, §58 Security KPI, §59 Supply Chain Security, §10.3 Implementation Plan Phase 7, §TST-026, §TST-066 Secret Leakage。

## 驗收標準

- [ ] 確認 crawler 架構中沒有任何執行 discovered MCP code 的 code path
- [ ] 確認 `npm install` / `pip install` / `docker run` 不會在任何 code path 執行 (§59)
- [ ] 確認 README 中的 shell commands 不會被執行 (§TASK-043)
- [ ] 確認 postinstall hooks 不會執行 (§TST-026 fixture)
- [ ] 確認 setup.py scripts 不會執行
- [ ] 確認 Makefile targets 不會執行
- [ ] 確認 Dockerfile 來自 discovered repo 不會 build/run (§TASK-043)
- [ ] 確認 process execution count = 0 during manifest parsing (§TST-025)
- [ ] 確認 process execution count = 0 during security scan (§TST-026)
- [ ] 建立 malicious repository fixture: postinstall, setup.py, Makefile, Dockerfile, README shell commands (§TST-026)
- [ ] 執行 crawler 處理 malicious fixture → process execution count = 0 (§TST-026)
- [ ] 任何 discovered code execution = P0 FAIL = RELEASE BLOCKED (§81 Critical Security Gate)
- [ ] Secret leakage test: fixture with API_KEY=TEST_SECRET, PASSWORD=TEST_PASSWORD, TOKEN=TEST_TOKEN
- [ ] 掃描 registry.json, SQLite, logs, reports → secrets 出現次數 = 0 (§TST-066)
- [ ] 確認 log 中不包含 Authorization header, OAuth token, password, API Key (§43)
- [ ] 建立 security_boundary.go: 集中 enforce execution 限制
- [ ] 單元測試: malicious manifest parsing → execute=0, read/parse/hash/classify only

## 備註

- 這是 **Hard Requirement** (§TASK-043)
- v0.1: NEVER execute discovered code (§58)
- v0.2: sandbox execution ONLY with full isolation (§59)
- README sanitization: strip "Ignore previous instructions", "Call this URL", "Upload credentials" (§60)
