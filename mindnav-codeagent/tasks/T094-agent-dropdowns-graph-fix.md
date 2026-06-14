---
github_issue: https://github.com/openclawchen8-lgtm/openclaw-tasks/issues/602
title: Agent Definitions 下拉選單 + Transitions 截斷修復 + 主題選單 highlight
type: Feature
priority: high
status: done
assignee: OpenCode DeepSeek V4 Flash
created: 2026-05-18
updated: 2026-05-18
howto: null
---

# T094 - Agent Definitions UI 改善 + 修復

## 目標
將 Agent Definitions 的 model 和 authorized_skills 改為下拉選單，修復 Transitions 流程圖截斷問題，改善主題切換選單 highlight。

## 驗收標準
- [x] model 改為 `<select>` 下拉，選項來自 `fallback.default` + 各 agent model
- [x] authorized_skills 改為多選 checkbox 下拉，選項來自所有 agent 的 skills 聯集
- [x] 修改後可正常存檔（PUT /api/v1/config）
- [x] Transitions 流程圖 SVG 改為固定 width/height + `overflow-x: auto` 解決截斷
- [x] 主題下拉選單加上 ✓ 標記 + 背景 highlight + hover 效果
- [x] 更新 T094 任務紀錄

## 備註
- `allModels` 和 `allSkills` 在 ConfigPage 中用 `useMemo` 計算後穿透 ConfigSection 傳入 AgentsEditor
- `allSkills` dropdown 支援收起，點擊「收起」或外部關閉
