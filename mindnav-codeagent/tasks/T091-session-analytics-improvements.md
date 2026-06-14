---
github_issue: https://github.com/openclawchen8-lgtm/openclaw-tasks/issues/599
title: Sessions 狀態欄位 + Analytics 統計總覽 tab
type: Feature
priority: medium
status: done
assignee: OpenCode DeepSeek V4 Flash
created: 2026-05-18
updated: 2026-05-18
howto: null
---

# T091 - Sessions 狀態欄位 + Analytics 統計總覽 tab

## 目標
改善 Sessions 頁面顯示，新增 Analytics 統計總覽頁面。

## 驗收標準
- [x] Sessions 表格新增「狀態」欄位，含彩色 badge（成功/失敗/進行中/取消）
- [x] 新增 AnalyticsPage 統計總覽頁面
- [x] Layout nav 加入「📊 統計總覽」tab（放最前面）
- [x] App.tsx 加入 `/analytics` 路由
- [x] 統計表格：專案數、任務總數、已完成/待處理/進行中/跳過、完成率
- [x] 各專案進度表（名稱、總數、完成、待辦、進行、進度%）
- [x] 燃盡圖（chart.js，聚合所有專案）
- [x] 修復 PendingTasksPage 載入中問題（改用 `/api/v1/tasks/pending`）
- [x] 修復 Config Fallback Models 顯示（schema type: list → dict）
- [x] `api/client.ts` 全面改用 v1 API endpoints

## 備註
- Legacy API `/api/tasks/pending` 回傳 500 → 前端改走 `/api/v1/tasks/pending`
- `fallback` schema 原標示為 `list` 但實際 config 資料為 `dict` → 修正為 `dict`
