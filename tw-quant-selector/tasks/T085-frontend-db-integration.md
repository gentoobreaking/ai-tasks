---
github_issue: https://github.com/openclawchen8-lgtm/openclaw-tasks/issues/798
title: 遷移前端投組管理至資料庫驅動架構
type: feature
priority: medium
status: done
assignee: gemini-3-flash-preview
created: 2026-05-30
updated: 2026-05-30
---

# T085 - 遷移前端投組管理至資料庫驅動架構

## 目標
將前端 `Portfolio` 頁面的投組資料管理從瀏覽器的 `localStorage` 遷移至後端資料庫 (`DuckDB`)。確保前端能透過 API 獲取資料，實現前後端資料同步。

## 驗收標準
- [x] 後端實作 `/api/v1/portfolio` GET 接口，從 `portfolio` 表讀取資料。
- [x] 前端 `Portfolio.tsx` 修改為在組件載入時，呼叫 `/api/v1/portfolio` 獲取資料並更新狀態。
- [x] 前端加入、刪除投組項目時，需正確呼叫後端 API 更新資料庫。
- [x] 移除或棄用前端對於 `localStorage` 的依賴（或改為僅做暫存）。
- [x] 驗證 SQL 更新資料庫後，前端能透過 API 即時載入更新。

## 備註
此變更將徹底改變前後端資料互動方式，需確保後端 CRUD API 完整性。
