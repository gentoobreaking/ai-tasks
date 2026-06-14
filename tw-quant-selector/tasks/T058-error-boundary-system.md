---
github_issue: https://github.com/gentoobreaking/ai-tasks/issues/701
title: Error Boundary System
type: feature
priority: medium
status: done
assignee: OpenCode DeepSeek V4 Flash
created: 2026-05-27
updated: 2026-05-28
howto: |
  1. 實作元件級 ErrorBoundary：單一元件失敗不影響其他元件，顯示 retry。
  2. 實作頁面級錯誤降級：保留上次成功快取 + 標示過時 + error page section。
  3. 實作全局 React Error Boundary：全屏錯誤頁 + 重新整理。
  4. 實作部分資料缺失策略：缺失欄位顯示「—」，底部顯示缺失摘要。
  5. 使用者友善錯誤訊息（非技術語言）。
---

# T058 - Error Boundary System

## 目標
實作三層錯誤邊界系統（元件級/頁面級/全局級），確保任何錯誤都不會導致整個應用崩潰，並提供清晰的降級體驗與使用者友善的錯誤訊息。

## 驗收標準
- [x] 元件級 Error Boundary：包裝 StatCard（Dashboard KPI 卡片）和 BacktestChart，失敗時顯示 `⚠ 無法載入 + [重試]`，不影響頁面其他部分
- [x] 頁面級錯誤降級：`usePageCache` hook + Dashboard 整合，API 失敗時讀取 sessionStorage 快取並標示「資料可能已過時」
- [x] 全局 Error Boundary：`<ErrorBoundary level="fullscreen">` 包裝 App Routes，全屏錯誤頁（不含 sidebar/nav）
- [x] 部分資料缺失：`<MissingDataSummary>` 元件 + Signals 底部顯示缺失摘要（連續天數/因子分數/排名變動）
- [x] 錯誤訊息語言友好：依分類（network / not_found / server_error / timeout / unknown）顯示「發生了什麼」+「為什麼」+「下一步」，技術細節可展開
- [x] 404→空狀態、500→retry、網路斷線→離線 banner，各類別不同降級

## 備註
- 參考 spec §15.1–15.3
- 目前已有錯誤處理分散在各頁面（try-catch + 狀態），需統合成 ErrorBoundary 元件
