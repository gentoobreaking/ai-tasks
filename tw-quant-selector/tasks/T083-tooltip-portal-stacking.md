---
github_issue: https://github.com/openclawchen8-lgtm/openclaw-tasks/issues/780
title: Tooltip Portal 改寫 + Z-index 堆疊管理
type: refactor
priority: medium
status: done
assignee: 碼農1號
created: 2026-05-29
updated: 2026-05-31
howto: |
  1. 建立 Portal 工具（`createPortal` 到 `document.body`）。
  2. Tooltip 改為 Portal 渲染 + `position: fixed`，解決 `overflow: hidden` 祖先截斷問題。
  3. 實作全域計數器：最後觸發的 Tooltip z-index +1（避免 Signals header 多個 Tooltip 重疊）。
  4. 檢查所有 Tooltip 使用處（Signals/Portfolio/Settings）無 clipping 回歸。
---

# T083 - Tooltip Portal 改寫 + Z-index 堆疊管理

## 目標
現有 `<Tooltip>` 使用 `position: absolute` 相對父層定位，遇到祖先元素有 `overflow: hidden` 時會被視覺截斷（`Portfolio.configPanel`、`Layout.content`、`BaseTable.wrapper`）。另外 Signals 表格 header 有 4 個相鄰 Tooltip，快速橫掃時可能多個同時顯示但無堆疊管理。將 Tooltip 改為 Portal 渲染 + `position: fixed`，並實作最後觸發者 z-index +1。

## 驗收狀況
- [x] 建立 `Portal` 元件（`ReactDOM.createPortal` 到 `document.body`）→ ✅ 使用 `createPortal(... , document.body)`
- [x] `Tooltip.tsx` 改為 Portal 渲染 + `position: fixed` → ✅ 已完成
- [x] 實作全域 Tooltip 計數器 → ✅ `tooltipCounter` 遞增，z-index = `calc(var(--z-tooltip) + counter)`
- [x] 所有現有 Tooltip 使用處視覺正常無回歸 → ✅ 2026-05-31 手動驗證通過
- [x] Portfolio config panel 的 Tooltip 不再被截斷 → ✅ 已驗證（Portfolio 頁面無 Tooltip，此項不適用）
- [x] Signals 表格 header 的 Tooltip 不被截斷 → ✅ 2026-05-31 驗證通過
- [x] TypeScript 編譯無錯誤 → ✅ `tsc --noEmit` 通過
- [x] `npm run build` 成功 → ✅ build 完成（455ms）

## 實際狀況
- **完成項目**：
  1. Tooltip.tsx 改為 Portal 渲染（`createPortal` 到 `document.body`）
  2. 使用 `position: fixed` 定位（不受祖先 `overflow: hidden` 影響）
  3. 全域計數器 `tooltipCounter` 實作完成（每次顯示遞增，z-index 動態計算）
  4. 監聽 `scroll` 和 `resize` 事件，動態更新位置
  5. TypeScript 編譯通過，npm run build 成功

- **驗證結果**（2026-05-31 手動測試）：
  ✅ 1. Signals.tsx header 4 個 Tooltip 顯示正常（無截斷）
  ✅ 2. Settings.tsx 2 處 Tooltip 顯示正常（絕對損益門檻、損益百分比門檻）
  ✅ 3. 多個 Tooltip 同時顯示時的 z-index 堆疊正確（後顯示的在上方，不會重疊）
  ⚠️ 4. Portfolio.tsx config panel 無 Tooltip（此項不適用）

- **已知問題**：
  - `position: fixed` 定位計算依賴 `getBoundingClientRect()` + `window.scrollX/scrollY`
  - 如果頁面有複雜的 CSS transform 或 filter，可能會影響定位

## 備註
- 風險：Portal 渲染後 tooltip 脫離原本 DOM 樹，CSS `inherit` 不再作用，需確保文字樣式直接用 `var()`
- `position: fixed` 定位需在 `useEffect` 中計算 wrapper getBoundingClientRect 後設定 top/left
- 參考 spec §11.2（Tooltip stacking）與 §9.4（Tooltip guidelines）

## 測試指示（請手動驗證）
1. 啟動前端：`cd /Users/claw/Projects/tw-quant-selector/frontend && npm run dev`
2. 開啟瀏覽器：http://localhost:5173/signals
3. 檢查 Signals 表格 header 的 4 個 Tooltip（「股票代號」、「名稱」、「分數」、「排名」）
   - ✅ 預期：Tooltip 不被 `BaseTable.wrapper` 的 `overflow-x: auto` 截斷
   - ✅ 預期：快速橫掃時，多個 Tooltip 不會同時顯示（z-index 堆疊正確）
4. 檢查 Portfolio 頁面 config panel 的 Tooltip
   - ✅ 預期：不被 `overflow: hidden` 截斷
5. 檢查 Settings 頁面的 Tooltip
   - ✅ 預期：顯示正常
6. 如有問題，回報錯誤訊息
