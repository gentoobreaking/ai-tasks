---
id: T027
project: gold-analysis
source_project: gold-analysis-improve
title: 修正 gold-analysis 單位錯誤
assignee: "pi with opencode/x-preview-f-free"
priority: medium
type: bugfix
status: done
created: 2026-04-16
updated: 2026-04-16
estimate: 1天
depends_on: []
github_issue: https://github.com/gentoobreaking/ai-tasks/issues/229
---

## 目標
修正 Settings 頁面單位顯示為 NT/克，確保系統內單位及價格皆使用新台幣及克。

## 驗收標準
- [ ] Settings 頁面單位顯示為 NT/克
- [ ] 所有價格皆使用新台幣及克

## 產出
- 前端 Settings 頁面：`frontend/src/components/pages/Settings.tsx`
- API 服務：`frontend/src/services/api.ts`

## 備註
需確認整個系統的一致性。