---
github_issue: https://github.com/gentoobreaking/ai-tasks/issues/560
title: REST API 標準化
type: Feature
priority: high
status: done
assignee: null
created: 2026-05-18
updated: 2026-05-18
howto: null
---

# T070 - REST API 標準化

## 目標
建立統一的 REST API 規範，確保所有 API endpoint有一致的 response 格式、錯誤處理和分頁機制。為未來 Dashboard 頁面提供穩定的 API contract。

## 驗收標準
- [x] 制定統一的 response 格式：`{"success": bool, "data": any, "error": string|null}`
- [x] 建立統一的錯誤處理 middleware
- [x] 實現分頁機制（cursor-based 或 offset-based）
- [x] API 版本化前綴：`/api/v1/*`
- [x] 現有 `/api/*` 路由逐步遷移到 `/api/v1/*`
- [x] 為每個 endpoint 添加 OpenAPI/Swagger 註解
- [x] 編寫 API 文件（可放在 `docs/api.md`）

## 備註
- 這是後續所有 API 相關任務的基礎
- 確保向後相容，舊 endpoint 可以 soft-deprecate
