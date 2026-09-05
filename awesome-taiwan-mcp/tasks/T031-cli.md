---
github_issue: N/A
title: CLI — crawl, verify, dedupe, score, export, stats, search commands
assignee: pi with opencode
type: feat
priority: high
status: done
depends_on: []
created: 2026-09-05
updated: 2026-09-05
---

# T031 - CLI — crawl, verify, dedupe, score, export, stats, search commands

## 目標

建立 CLI interface, 支援所有爬蟲操作。對應 CRAWLER_AGENT_TASKS.md §23 TASK-031, §44 CLI, §45 Query。

## 驗收標準

- [x] CLI 使用 cobra library (§3 Technology Stack)
- [x] `crawler version` 命令: 回傳版本字串和構建信息
- [x] `crawler crawl` 命令
- [x] `crawler crawl --source github` 命令: 僅爬指定 source
- [x] `crawler crawl --source all` 命令: 爬所有啟用的 sources
- [x] `crawler crawl --full` 旗標: 強制全量爬蟲 (非增量)
- [x] `crawler verify` 命令: 單獨執行 verification stage
- [x] `crawler dedupe` 命令: 單獨執行 deduplication stage
- [x] `crawler score` 命令: 單獨執行 quality scoring stage
- [x] `crawler export` 命令: 生成 registry JSON exports (T028)
- [x] `crawler stats` 命令: 顯示 registry 統計信息 (sources scanned, candidates, unique MCP, taiwan relevant by level, health by status)
- [x] `crawler search <query>` 命令: 按關鍵字搜索 (name, description, category, tools, data sources)
- [x] `crawler search --level T5` 命令: 按 Taiwan relevance level 過濾
- [x] `crawler search --category finance` 命令: 按 category 過濾
- [x] `crawler search --min-score 80` 命令: 按 quality score 閾值過濾
- [x] `crawler search` 結果排序: Taiwan relevance + capability match + health + quality
- [x] CLI 輸出格式: human-readable table (for stats/search), structured JSON (for --json flag)
- [x] CLI 支援 `--config` 指定 config.yaml 路徑
- [x] CLI 支援 `--db` 指定 SQLite 資料庫路徑 (default: ./data/registry.db)

## 備註

- CLI 命令對應 §44 CLI: crawl, verify, dedupe, score, export, stats
- Search 對應 §45 Query: search twse, search real-estate, search government, search --level T5
- Stats 輸出格式參考 §46 Output
- Cobra CLI 結構: root command + subcommands

## 執行紀錄（2026-09-05 稽核）
- 已達成: 依據最終驗證 (T045) 通過 build+test+vet+mod verify, 代碼在對應 internal/ 套件中實現, 測試覆蓋率達標
