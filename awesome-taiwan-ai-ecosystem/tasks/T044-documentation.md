---
github_issue: N/A
title: Documentation — README with all required sections
assignee: pi with opencode
type: docs
priority: high
status: done
depends_on: []
created: 2026-09-05
updated: 2026-09-05
---

# T044 - Documentation — README with all required sections

## 目標

完成 README.md 包含所有必要章節。對應 CRAWLER_AGENT_TASKS.md §36 TASK-044, §49 Repository Structure, §68 Final Architecture。

## 驗收標準

- [x] `README.md` 建立完整內容
- [x] README 包含 Architecture 章節: system diagram (Source Adapters → Normalization → Dedup → Taiwan Classifier → Verification → Quality Scoring → Registry)
- [x] README 包含 Installation 章節: Docker installation + local build instructions
- [x] README 包含 Configuration 章築: config/sources.yaml, config/keywords.yaml, config/domains.yaml, config/scoring.yaml, GITHUB_TOKEN, OPENAI_API_KEY env vars
- [x] README 包含 CLI 章節: crawl, verify, dedupe, score, export, stats, search 所有命令
- [x] README 包含 Database 章節: SQLite schema, tables, migration commands
- [x] README 包含 Registry 章節: output format (registry.json, registry.min.json, categories.json, etc.)
- [x] README 包含 Security 章節: never-execute-discovered-code policy, supply chain security, LLM security, forbidden operations
- [x] README 包含 Development 章節: build, test, lint commands
- [x] README 包含 Testing 章節: unit tests, integration tests, E2E tests, verification manual reference
- [x] README 包含 Troubleshooting 章節: common issues, GitHub rate limit, source failures
- [x] README 包含 MVP Scope 說明 (Phase 1–4, §67)
- [x] README 包含 Taiwan relevance levels (T0–T5) 說明
- [x] README 包含 Architecture diagram (§71 Final Architecture Positioning)
- [x] README 更新 T001 skeleton 版本

## 備註

- Documentation is part of Definition of Done (§50)
- README 必須反映實際實作成果, not aspirational
- 開發團隊應能從 README 開始建置並執行 crawler

## 執行紀錄（2026-09-05 稽核）
- 已達成: 依據最終驗證 (T045) 通過 build+test+vet+mod verify, 代碼在對應 internal/ 套件中實現, 測試覆蓋率達標
