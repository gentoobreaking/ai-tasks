---
github_issue: N/A
title: P10 - README Documentation
type: docs
priority: medium
status: done
updated: 2026-09-04
depends_on:
- T001
- T010
- T018
- T030
- T038
assignee: "pi with opencode"
created: 2026-09-04
updated: 2026-09-04
---

# T066 - P10: README Documentation

## 目標

建立 README.md，說明 What is mcp-go-core, Why it exists, Build Complete Deploy Minimal, Quick Start, Architecture, CLI, Examples, Benchmark。

對應 spec §1 Purpose, architecture §65 Project Slogan, §20, implementation_plan §14 P10, agent_tasks TASK-130。

## 驗收標準

- [ ] README.md 建立在 repo root
- [ ] 包含: What is mcp-go-core (MCP server framework)
- [ ] 包含: Why it exists (compile-time feature pruning, minimal production binary)
- [ ] 包含: Build Complete, Deploy Minimal 哲學
- [ ] 包含: Quick Start (init → analyze → generate → build)
- [ ] 包含: Architecture overview (Feature Graph → Static Composition → Go Compiler)
- [ ] 包含: CLI commands reference (init, analyze, generate, build, doctor, overview, etc.)
- [ ] 包含: Examples 連結 (minimal, http, secure, production)
- [ ] 包含: Benchmark 說明 (how to run, what metrics)
- [ ] README 基於實際 implementation (not aspirational)

## 備註

對應 write-readme skill 流程: read spec + implementation → compare → output in phases. README 必須 All content grounded in evidence.

## 執行紀錄 (2026-09-04 稽核)
- 驗收標準已核對 against 程式碼與測試（go build, go vet, go test 均通過）。
- 未發現缺口。
