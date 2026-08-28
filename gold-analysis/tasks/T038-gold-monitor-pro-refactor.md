---
id: T038
project: gold-analysis
source_project: gold-analysis-improve
title: gold_monitor_pro 架構重構：移除 SQLite 寫入，改用 tmp file 即時檢查
assignee: "pi with opencode/x-preview-f-free"
priority: high
type: feature
status: done
created: 2026-04-18
updated: 2026-04-18
estimate: 2天
depends_on:
  - T037
github_issue: https://github.com/gentoobreaking/ai-tasks/issues/117
---

## 目標
重構 gold_monitor_pro 架構：
1. 移除 SQLite 寫入（改用 tmp file 即時檢查）
2. 整合台灣銀行 URL 模式
3. 簡化架構、提升可靠性

## 驗收標準
- [ ] 移除 SQLite 寫入邏輯
- [ ] 改用 tmp file 即時檢查
- [ ] 整合台灣銀行 URL 模式
- [ ] 架構簡化、測試通過

## 產出
- 重構後的 `gold_monitor_pro.py`

## 備註
Phase 7 架構重構最後任務。