---
github_issue: https://github.com/gentoobreaking/ai-tasks/issues/804
title: 移除 Strategy 頁面大師策略庫硬編碼假資料
type: refactor
priority: high
status: done
assignee: OpenCode DeepSeek V4 Flash
created: 2026-05-30
updated: 2026-06-01
howto: /Users/claw/Projects/tw-quant-selector/CODE_REVIEW_REPORT.md
---

# T091 - 移除 Strategy 頁面大師策略庫硬編碼假資料

## 目標
`frontend/src/pages/Strategy.tsx` 中的 `GURU_LIST` 包含 `passCount` 欄位，顯示「預計篩選通過檔數」，但這些數字是 **完全硬編碼的假資料**（420、380、350...），並未實際查詢數據庫。此任務要移除這些假資料，避免誤導使用者。

## 驗收標準
- [x] 從 `GuruCondition` interface 移除 `passCount` 欄位定義
- [x] 從 `GURU_LIST` 所有大師的 `conditions` 中移除 `passCount`
- [x] 從前端顯示邏輯中移除 `passCount` 相關程式碼
- [x] 更新 CSS 樣式（移除 `.conditionPassCount` 或改為顯示 `threshold`）
- [x] UI 排版正常，沒有破版
- [x] 確認 Strategy 頁面功能正常

## 備註
- **風險**：移除 `passCount` 後，使用者看不到每個條件的預估通過數量
- **替代方案**：如果需要顯示真實數字，應新增後端 API `/api/v1/guru/pass-count` 實際查詢數據庫（但工作量較大）
- **建議**：先採用簡單方案（移除 `passCount`），未來如有需求再實作 API
- **參考**：CODE_REVIEW_REPORT.md 問題 1（🔴 嚴重）
