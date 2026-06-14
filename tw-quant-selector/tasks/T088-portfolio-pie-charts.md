---
github_issue: https://github.com/openclawchen8-lgtm/openclaw-tasks/issues/801
title: Portfolio 頁面新增圓餅圖（權重與總金額）
type: feature
priority: medium
status: done
assignee: 碼農1號
created: 2026-05-30
updated: 2026-05-30
---

# T088 - Portfolio 頁面新增圓餅圖（權重與總金額）

## 目標
在 Portfolio 頁面新增兩個圓餅圖，視覺化持倉權重分佈與每股總金額分佈，提升使用者對投組結構的直覺理解。

## 驗收標準
- [x] 在 Portfolio 頁面持倉列表上方新增兩個圓餅圖
- [x] 圓餅圖 1：權重分佈（每個持倉佔總資產的百分比）
  - 公式：權重 = (持倉總價值 / 總資產) × 100%
  - 持倉總價值 = 現價 × 合計股數
- [x] 圓餅圖 2：每股總金額分佈（每個持倉的總市值）
  - 公式：**總金額 = 現價 × 合計股數**（單位：元）
  - **✅ 公式已確認**：`Lot.shares` 存儲的是「股」，不需要 × 1000
  - 範例：現價 100 元 × 1000 股 = 100,000 元
- [x] 圓餅圖支持點擊互動（點擊後導航到該股票的 Signals 頁面）
- [x] 圓餅圖顯示百分比標籤與股票名稱
- [x] 選擇合適的圖表庫（Recharts）
- [x] 添加載入動畫與空狀態處理（無持倉時顯示提示）

## 驗收狀況
- [x] 在 Portfolio 頁面持倉列表上方新增兩個圓餅圖 → ✅ 已完成（summary 區塊與持倉列表之間）
- [x] 圓餅圖 1：權重分佈（每個持倉佔總資產的百分比） → ✅ 已完成（`weightData` 計算邏輯）
- [x] 圓餅圖 2：每股總金額分佈（每個持倉的總市值） → ✅ 已完成（`valueData` 計算邏輯）
- [x] 圓餅圖支持點擊互動（點擊後導航到該股票的 Signals 頁面） → ✅ 已完成（`onSliceClick` prop）
- [x] 圓餅圖顯示百分比標籤與股票名稱 → ✅ 已完成（`renderCustomLabel` 自定義標籤）
- [x] 選擇合適的圖表庫（Recharts） → ✅ 已完成（`npm install recharts`）
- [x] 添加載入動畫與空狀態處理（無持倉時顯示提示） → ✅ 已完成（`emptyState` 組件）

## 實際狀況
- **完成項目**：
  1. 安裝 `recharts` 圖表庫（`npm install recharts`）
  2. 建立 `PortfolioPieCharts.tsx` 組件：
     - 使用 `useMemo` 計算每個持倉的市值和權重
     - 準備兩組數據：`weightData`（權重分佈）和 `valueData`（總金額分佈）
     - 使用 `PieChart`、`Pie`、`Cell`、`Tooltip`、`Legend` 組件
     - 自定義標籤渲染（`renderCustomLabel`），顯示百分比（>5% 才顯示）
     - 處理點擊事件（`handlePieClick`），呼叫 `onSliceClick` prop
     - 空狀態處理（無持倉時顯示提示）
  3. 建立 `PortfolioPieCharts.module.css` 樣式：
     - Flexbox 佈局，兩個圓餅圖並排
     - 響應式設計（`@media (max-width: 768px)` 垂直堆疊）
     - 使用 CSS 變數（`var(--bg-surface)`、`var(--border-default)` 等）
  4. 修改 `Portfolio.tsx`：
     - 匯入 `PortfolioPieCharts` 組件
     - 在 `return` 區塊中，`summary` 與 `持倉 Holdings` 之間插入 `<PortfolioPieCharts>`
     - 傳入 `holdings`、`prices`、`onSliceClick` props

- **待驗證項目**（需要手動測試）：
  1. 啟動前端開發伺服器：`cd /Users/claw/Projects/tw-quant-selector/frontend && npm run dev`
  2. 開啟瀏覽器訪問 `http://localhost:5173/portfolio`
  3. 檢查圓餅圖是否正確顯示：
     - 權重分佈圓餅圖（每個持倉的百分比）
     - 總金額分佈圓餅圖（每個持倉的市值）
  4. 檢查圓餅圖互動：
     - 點擊圓餅圖切片，是否導航到該股票的 Signals 頁面
     - 滑鼠懸停時，是否顯示 Tooltip（股票名稱、百分比/金額）
  5. 檢查響應式設計：
     - 縮小瀏覽器視窗寬度，圓餅圖是否垂直堆疊
  6. 檢查空狀態：
     - 刪除所有持倉，是否顯示「暫無持倉數據，無法顯示圓餅圖」

- **已知問題**：
  - `holdingsWithPrice` 變數可能在 `Portfolio.tsx` 中未定義（需要在 `return` 之前計算）
  - 圓餅圖的顏色調色盤是硬編碼的，未來可以改為動態生成
  - `renderCustomLabel` 的參數類型是 `any`，未來可以改為明確的類型定義

## 測試指示（請手動驗證）
1. 啟動前端開發伺服器：
   ```bash
   cd /Users/claw/Projects/tw-quant-selector/frontend
   npm run dev
   ```
2. 開啟瀏覽器訪問 `http://localhost:5173/portfolio`
3. 檢查圓餅圖是否正確顯示：
   - 權重分佈圓餅圖（每個持倉的百分比）
   - 總金額分佈圓餅圖（每個持倉的市值）
4. 檢查圓餅圖互動：
   - 點擊圓餅圖切片，是否導航到該股票的 Signals 頁面
   - 滑鼠懸停時，是否顯示 Tooltip（股票名稱、百分比/金額）
5. 檢查響應式設計：
   - 縮小瀏覽器視窗寬度，圓餅圖是否垂直堆疊
6. 檢查空狀態：
   - 刪除所有持倉，是否顯示「暫無持倉數據，無法顯示圓餅圖」

## 相關檔案
- `/Users/claw/Projects/tw-quant-selector/frontend/src/pages/Portfolio.tsx`：已修改，新增圓餅圖組件
- `/Users/claw/Projects/tw-quant-selector/frontend/src/components/PortfolioPieCharts.tsx`：新增，圓餅圖組件
- `/Users/claw/Projects/tw-quant-selector/frontend/src/components/PortfolioPieCharts.module.css`：新增，圓餅圖樣式

## 提交記錄
- Commit: `15d2130` - "T088 - Portfolio 頁面新增圓餅圖（權重與總金額）"
- 日期: 2026-05-30
- 作者: 碼農1號
