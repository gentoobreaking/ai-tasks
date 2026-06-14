---
github_issue: https://github.com/openclawchen8-lgtm/openclaw-tasks/issues/XXX
title: 策略設定歷史分頁 + 批量刪除
type: feature
priority: medium
status: done
assignee: OpenCode DeepSeek V4 Flash
created: 2026-05-31
updated: 2026-06-01
howto: |
  1. 前端添加分頁狀態：`historyPage`, `historyPageSize`（預設 5 筆）
  2. 計算分頁資料：`slice((page-1)*pageSize, page*pageSize)`
  3. 用 T084 的 `<Dropdown>` 組件替換每頁筆數選擇（移除 `<select>`）
  4. 添加複選框與批量刪除按鈕（全選/取消全選）
  5. 檢查後端是否支援批量刪除 API（`DELETE /api/v1/strategy/config-history/batch`）
  6. 若無後端 API，新增路由（參照 T082 Backtest 批量刪除實作）
  7. TypeScript 編譯無錯誤 → `tsc --noEmit`
  8. `npm run build` 成功
---

# T098 - 策略設定歷史分頁 + 批量刪除

## 目標
Strategy 頁面「設定歷史 Config History」區域目前僅單純展示，無分頁與批量刪除功能。需新增：
1. **分頁功能**：預設每頁 5 筆，支援 5/10/20/30/50 筆切換（使用 T084 自定義 `<Dropdown>` 組件）
2. **批量刪除**：每筆歷史記錄旁添加複選框，支援勾選多筆後批量刪除（含全選/取消全選）

## 驗收狀況
- [x] 前端添加 `historyPage`, `historyPageSize`, `selectedHistoryIds` 狀態（預設 5 筆）
- [x] 用 `<Dropdown>` 替換每頁筆數選擇（無原生 `<select>`）
- [x] 分頁控件顯示正確（第 X 頁 / 共 Y 頁，總筆數 Z）
- [x] 添加複選框與「全選/取消全選」功能
- [x] 添加「批量刪除」按鈕（僅有勾選時可點擊）
- [x] 後端 API `DELETE /api/v1/strategy/config-history/batch` 已新增
- [x] 批量刪除成功後前端狀態同步更新（filter + reset selection）
- [x] TypeScript 編譯無錯誤
- [x] `npm run build` 成功

## 實際狀況
- **完成項目**：
  - ✅ 後端已新增 `DELETE /api/v1/strategy/config-history/batch`
  - ✅ 前端分頁狀態與邏輯（`historyPage`, `historyPageSize`, `paginatedHistory`, `totalHistoryPages`）
  - ✅ 用 `<Dropdown>` 組件取代 `<select>`（每頁 5/10/20/30/50 筆）
  - ✅ 複選框 UI 與邏輯（`selectedHistoryIds` state, `toggleSelectAllHistory`, `toggleSelectHistory`）
  - ✅ 批量刪除按鈕（僅有勾選時可點擊，包含 `historyDeleting` 狀態）
  - ✅ 批量刪除後前端同步更新（filter + reset selection + page reset）
  - ✅ 分頁控件顯示（第 X 頁 / 共 Y 頁，總筆數 Z）
  - ✅ `tsc -b && vite build` 通過

## 備註
- 參照 T084 的 `<Dropdown>` 組件實作（避免使用原生 `<select>`）
- 分頁邏輯可參照 Portfolio.tsx 的 `alertLogPagination` 實作
- 批量刪除 UI 可參照 Backtest.tsx 的 `selectedDeleteIds` 邏輯
- 風險：若設定歷史筆數過多（>1000），分頁效能可能受影響（需監控）

## 測試指示（待實作完成後手動驗證）
1. 啟動前端：`cd /Users/claw/Projects/tw-quant-selector/frontend && npm run dev`
2. 開啟瀏覽器：`http://localhost:5173/strategy`
3. 檢查「設定歷史 Config History」區域：
   - ✅ 預設顯示 5 筆記錄
   - ✅ 每頁筆數下拉選單顯示為自定義 `<Dropdown>`（非原生 `<select>`）
   - ✅ 切換每頁筆數後，顯示筆數正確更新
   - ✅ 分頁控件顯示正確（第 X 頁 / 共 Y 頁）
   - ✅ 複選框可勾選/取消
   - ✅ 「全選」按鈕功能正確
   - ✅ 勾選至少 1 筆後，「批量刪除」按鈕可點擊
   - ✅ 批量刪除成功後，前端狀態同步更新（已刪除項目消失）
4. 如有問題，回報錯誤訊息
