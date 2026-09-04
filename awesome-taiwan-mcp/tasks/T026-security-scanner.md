---
github_issue: N/A
title: Security Scanner — static analysis of discovered MCP code
type: feat
priority: high
^status: done
depends_on: [T002]
assignee: agent
created: 2026-09-05
updated: 2026-09-05
---

# T026 - Security Scanner — static analysis of discovered MCP code

## 目標

建立 `internal/verify/security.go`, 對 discovered MCP 進行 static analysis。
對應 CRAWLER_AGENT_TASKS.md §28 TASK-028, §33 Security Assessment, §59 Supply Chain Security。

## 驗收標準

- [ ] `internal/verify/security.go` 建立
- [ ] `SecurityScanner` struct 實現: `Scan(server *MCPServer) ([]SecurityFinding, error)`
- [ ] Static analysis patterns (§33):
  - exec, shell, eval, subprocess, child_process, os.system
  - filesystem write
  - credential collection
  - arbitrary URL fetch
  - browser automation
  - RCE patterns
  - hardcoded secrets (API keys, passwords, tokens)
- [ ] SecurityFinding struct 實現 (§12 Registry Schema Security): Type, Severity (LOW/MEDIUM/HIGH/CRITICAL/UNKNOWN), Source, Location, Evidence
- [ ] Risk levels: LOW, MEDIUM, HIGH, CRITICAL, UNKNOWN (§33)
- [ ] 每個 finding 必須包含: type, severity, source, location, evidence (§TST-044)
- [ ] Security scan 僅做 static analysis, 不執行任何 discovered code (§59: 只做 metadata inspection)
- [ ] 掃描範圍: README, source code 文件 (static text scan, not execution), package.json scripts, Dockerfile, Makefile, setup.py, postinstall hooks
- [ ] 單元測試: malicious fixture (shell execution, filesystem write, credential access, RCE) → 每個 finding type, severity, source, location, evidence 都存在 (§TST-044)
- [ ] 單元測試: 掃描過程中不執行任何指令 (§TST-025: executed commands = 0)
- [ ] 單元測試: legitimate MCP → CRITICAL finding count = 0
- [ ] Scan 方法保存結果到 SQLite security_findings 表

## 備註

- 絕對不能執行 discovered code (§58 Security KPI: NEVER execute discovered MCP)
- v0.1 只做 static analysis, 不執行 sandbox (§59: v0.2 才考慮)
- Security scanner 用於 Quality Score 的 Security component (max 5 points, T025)
- Hardcoded secrets detection: API_KEY=, PASSWORD=, TOKEN=, SECRET= patterns
