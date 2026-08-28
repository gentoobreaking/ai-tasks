---
id: T036
project: gold-analysis
source_project: gold-analysis-improve
title: gold_bot_history.py 重構：DB自動建立 + gap-filling
assignee: "pi with opencode/x-preview-f-free"
priority: high
type: feature
status: done
created: 2026-04-18
updated: 2026-04-18
estimate: 2天
depends_on:
  - T035
github_issue: https://github.com/gentoobreaking/ai-tasks/issues/115
---

## 目標
重構 `gold_bot_history.py` 解決三個問題：
1. DB 不存在時崩掉 → 自動建立 DB + schema
2. gap-filling 缺失 → 某些日期空缺自動補齊
3. 程式碼結構優化

## 驗收標準
- [ ] DB 不存在時自動建立 + schema
- [ ] 缺失日期自動 gap-filling
- [ ] 程式碼結構優化（模組化、錯誤處理）

## 產出
- 重構後的 `gold_bot_history.py`

## 備註
Phase 7 腳本重構。