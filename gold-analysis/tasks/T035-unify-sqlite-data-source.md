---
id: T035
project: gold-analysis
source_project: gold-analysis-improve
title: 統一 SQLite 資料來源 + 台灣銀行 1 年歷史數據
assignee: "pi with opencode/x-preview-f-free"
priority: high
type: feature
status: done
created: 2026-04-18
updated: 2026-04-18
estimate: 2天
depends_on:
  - T034
github_issue: https://github.com/gentoobreaking/ai-tasks/issues/236
---

## 目標
統一 `/analysis` 和 `/technicals` 的資料來源：改用 Yahoo Finance 為主、台灣銀行 1 年歷史為輔，移除舊 SQLite 讀取邏輯。

## 驗收標準
- [ ] `/analysis` 和 `/technicals` 使用同一資料源
- [ ] 移除舊 SQLite 讀取邏輯
- [ ] 整合台灣銀行 1 年歷史數據作為輔助

## 產出
- 統一資料源邏輯

## 備註
Phase 7 數據源統一。