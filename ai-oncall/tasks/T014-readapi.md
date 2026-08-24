---
github_issue: N/A
title: UI 專用唯讀查詢 readapi
type: feat
priority: medium
status: pending
depends_on:
- T006
assignee: "pi with opencode/x-preview-f-free"
created: 2026-08-24
updated: 2026-08-24
---

# T014 - UI 專用唯讀查詢 readapi

## 目標
`readapi/`：僅綁 127.0.0.1 的唯讀 HTTP 端點 `/api/incidents` `/api/incidents/{id}`
`/api/runbooks` `/api/stats`——oncall-ui 的資料源。**安全鐵律：不碰 SQLite 檔案以外
的任何執行面；所有 handler 僅 GET。**

## 驗收標準
- [ ] 端點契約測試（分頁/篩選/排序）
- [ ] 只讀斷言：無 POST/PUT/DELETE 路由（測試掃描路由表白名單）
- [ ] bind 預設 127.0.0.1，改 0.0.0.0 啟動印警告