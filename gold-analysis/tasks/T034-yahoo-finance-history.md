---
id: T034
project: gold-analysis
source_project: gold-analysis-improve
title: 接 Yahoo Finance 歷史黃金報價
assignee: "pi with opencode/x-preview-f-free"
priority: high
type: feature
status: done
created: 2026-04-18
updated: 2026-04-18
estimate: 1天
depends_on: []
github_issue: https://github.com/gentoobreaking/ai-tasks/issues/114
---

## 目標
技術分析 API（`/api/technicals`）目前讀 SQLite，但 SQLite 為空，導致指標計算失敗。改從 Yahoo Finance 取得黃金現貨（GC=F 或 GLD）的歷史日 K 數據，補足 60+ 根 K 線後再交給 `TechnicalAnalysisAgent` 計算。

## 驗收標準
- [ ] 從 Yahoo Finance 取得 GC=F/GLD 歷史日 K 線
- [ ] 補足 60+ 根 K 線
- [ ] 交給 TechnicalAnalysisAgent 計算指標
- [ ] `/api/technicals` 正常回傳指標

## 產出
- Yahoo Finance 適配器邏輯
- `/api/technicals` 正常運作

## 備註
Phase 7 數據源改善。