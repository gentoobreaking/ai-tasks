---
github_issue: 
title: 前端安全與一致性修復（XSS / 死登入邏輯 / fetch 統一）
type: fix
priority: high
status: done
depends_on: []
assignee: pi with opencode/x-preview-f-free
created: 2026-08-23
updated: 2026-08-24
---

# T35 - 前端安全與一致性修復（XSS / 死登入邏輯 / fetch 統一）

## 目標
修復 ReportViewer 以 dangerouslySetInnerHTML 渲染檔案內容的 XSS 風險；移除無對應功能的 auth_token 攔截與 /login 轉址；將 Dashboard/Settings 殘餘原生 fetch 統一走共用 api client。

## 驗收標準
- [x] ReportViewer 改安全純文字渲染（React 自動跳脫）
- [x] 移除 auth_token 攔截與 /login redirect（專案無認證機制）
- [x] health 端點呼叫統一走 api client，並覆寫 baseURL 修復 404 誤判「資料庫異常」

## 備註
health 端點位於根路徑而非 /api/v1，client 需以 `{ baseURL: '' }` 覆寫。
