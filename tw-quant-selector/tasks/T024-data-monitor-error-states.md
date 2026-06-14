---
github_issue: https://github.com/gentoobreaking/ai-tasks/issues/658
title: 資料監控與錯誤/空/載入狀態
type: feature
priority: medium
status: done
assignee: gemini-3-flash-preview
created: 2026-05-26
updated: 2026-05-26
howto: |
  1. Create Monitor page at frontend/src/pages/Monitor.tsx
     - Top health indicator: large status badge (● 系統正常/注意/異常)
     - Dataset status table (spec §3.6): dataset name, last update, coverage days, missing days, status indicator
     - Operation log table (last 7 days): timestamp, module, event, status (✓/⚠/✗)
     - Missing data section (collapsible): stock list per dataset with [手動補抓] button
  2. Create shared components:
     - SkeletonLoader: mimics shape of real content, shimmer animation 1.5s cycle
     - EmptyState: icon + message + action list + link to /monitor
     - ErrorBoundary: catches render errors, shows inline error + retry
     - Toast (spec §3.9): positioned bottom-right, 3 max, severity levels
  3. Create API response wrapper that handles 404/500/network errors per spec §9.3
  4. Apply skeleton loading to all existing pages (Dashboard, Signals, Backtest)
---

# T024 - Data Monitor & Error/Empty/Loading States

## 目標
實作資料監控頁（/monitor）與全站共用的錯誤/空狀態/載入中元件，確保所有頁面在各種狀態下都有對應的 UX。

## 驗收標準
### Monitor 頁面
- [x] 頂部系統健康狀態顯示：大型狀態指示燈（正常=bull/注意=neutral/異常=bear/離線=muted）
- [x] 資料集狀態表格：資料集名稱、最後更新時間、覆蓋天數、缺失天數、狀態指示燈
- [x] 近 7 日操作日誌：時間戳、模組、事件、狀態（✓/⚠/✗）
- [x] 缺失資料可折疊區塊：列出缺少資料的股票，附 [手動補抓] 按鈕
- [x] 資料狀態 60 秒輪詢更新（僅在 Monitor 頁面啟用輪詢，切換頁面時停止）
- [x] 資料老舊指示（data staleness）：超過 24 小時未更新的欄位標頭顯示黃色警示點，hover tooltip 顯示最後更新時間（spec §5.1）

### 共用元件
- [x] SkeletonLoader：形狀與真實內容一致，左到右流動光暈動畫 1.5s
- [x] EmptyState：圖示 + 說明文字 + 可能原因清單 + 前往資料監控連結
- [x] ErrorBoundary：捕捉 render 錯誤，顯示內嵌錯誤訊息 + [重試] 按鈕
- [x] Toast 元件：右下角顯示，最多同時 3 則，寬度 320px，左側邊框顏色依 severity 區分（CRITICAL=bear、HIGH=neutral、MEDIUM=accent），自動消失時間：CRITICAL 不消失、HIGH 10s、MEDIUM/LOW 5s
- [x] Tooltip 共用元件：觸發延遲 300ms、消失延遲 150ms、優先向上顯示、background `--bg-overlay`、border-radius 6px、padding 8px 12px、font-size 12px、max-width 240px（spec §3.8）

### 錯誤處理（全站）
- [x] API 404 → 顯示 EmptyState（不跳 toast）
- [x] API 500 → 元件內嵌錯誤訊息 + 重試按鈕，console.log 記錄
- [x] 網路斷線 → 頂部 banner「離線中，顯示快取資料」
- [x] 逾時 >10s → 顯示超時錯誤 + 重試按鈕

## 備註
- 參考 spec §3.6 Data Monitor、§3.8 Tooltip、§3.9 Toast、§5 Loading/Empty、§9.3 Error Handling
- 禁止使用旋轉 spinner（spec §5.1），改使用骨架屏
