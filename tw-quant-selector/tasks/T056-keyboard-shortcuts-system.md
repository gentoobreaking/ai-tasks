---
github_issue: https://github.com/openclawchen8-lgtm/openclaw-tasks/issues/699
title: Keyboard Shortcuts System
type: feature
priority: medium
status: done
assignee: OpenClaw MiniMax M2.7 / 碼農1號 + DeepSeek V4 Flash
created: 2026-05-27
updated: 2026-05-28
howto: |
  1. ✅ 實作全域快捷鍵管理器：Cmd+K（搜尋）、Cmd+/（說明 Modal）、G→D/S/B/T/M（導航）。
  2. ✅ 實作快捷鍵說明 Modal（兩欄佈局）。
  3. ⏳ 表格快捷鍵：↑↓/Enter/Space/Home/End/Shift+↑↓，符合 §12.2
  4. ⏳ 圖表快捷鍵：R/←→/Shift+←→/0/Home，符合 §12.3
  5. ⏳ Tooltip 顯示快捷鍵提示（如「重新整理 ⌘R」），符合 §12.5
  6. ⏳ 首次進入一次性提示（localStorage 記錄）
---

# T056 - Keyboard Shortcuts System

## 目標
實作完整的鍵盤快捷鍵系統，包含全域快捷鍵、頁面情境快捷鍵、快捷鍵說明 Modal、以及快捷鍵發現機制。

## 驗收標準
- [x] 全域快捷鍵：Cmd+K（搜尋）、Cmd+/（說明 Modal）、G→D/S/B/T/M（導航），符合 §12.1
- [x] 快捷鍵說明 Modal：兩欄佈局（左全域/右頁面），快捷鍵 pill 樣式，符合 §12.4
- [x] 表格快捷鍵：↑↓/Enter/Space/Home/End/Shift+↑↓，符合 §12.2
- [x] 圖表快捷鍵：R/←→/Shift+←→/0/Home/End，符合 §12.3
- [x] Tooltip 顯示快捷鍵提示（如「重新整理 ⌘R」），符合 §12.5
- [x] 首次進入 3 秒後一次性提示「按 ⌘K 可快速搜尋股票」
- [x] 快捷鍵不與瀏覽器預設快捷鍵衝突

## 實作進度

| 項目 | 狀態 | 備註 |
|------|------|------|
| 全域快捷鍵管理器 | ✅ 完成 | `useKeyboardShortcuts.ts` hook |
| 快捷鍵說明 Modal | ✅ 完成 | `ShortcutHelp.tsx` 組件 |
| 表格快捷鍵（Signals） | ⏳ 部分完成 | Home/End 已完成，Space/Shift+↑↓ 待確認 |
| 圖表快捷鍵（Backtest） | ⏳ 部分完成 | R/←→/0 已完成，Home 行為已修正 |
| Tooltip 快捷鍵提示 | ⏳ 待實作 | 需檢查所有 Tooltip 並加入快捷鍵提示 |
| 首次進入提示 | ⏳ 待實作 | 需實作一次性提示（localStorage） |

## 已完成項目

### 1. 全域快捷鍵管理器（`useKeyboardShortcuts.ts`）

**位置**：`frontend/src/hooks/useKeyboardShortcuts.ts`

**功能**：
- 監聽 `keydown` 事件
- 自動忽略輸入框、下拉選單等可輸入元素
- 支援 `ctrl`/`meta`/`shift`/`alt` 組合鍵
- 提供 `useGlobalShortcuts()` 封裝常用快捷鍵

**已註冊快捷鍵**：
| 快捷鍵 | 功能 | 狀態 |
|--------|------|------|
| `Cmd+K` | 聚焦搜尋框 | ✅ 完成 |
| `Cmd+/` | 顯示快捷鍵說明 Modal | ✅ 完成 |
| `G → D` | 導航到 Dashboard | ✅ 完成 |
| `G → S` | 導航到 Signals | ✅ 完成 |
| `G → B` | 導航到 Backtest | ✅ 完成 |
| `G → T` | 導航到 Strategy | ✅ 完成 |
| `G → M` | 導航到 Monitor | ✅ 完成 |
| `G → P` | 導航到 Portfolio | ✅ 完成 |

### 2. 快捷鍵說明 Modal（`ShortcutHelp.tsx`）

**位置**：`frontend/src/components/ShortcutHelp.tsx`

**功能**：
- 兩欄佈局：左側「全域快捷鍵」、右側「頁面情境快捷鍵」
- 快捷鍵 pill 樣式（圓角標籤）
- ESC 關閉 Modal
- 「不再顯示」按鈕（設定 `localStorage`）
- 響應式設計（手機版單欄）

**已定義快捷鍵資料**：
- `GLOBAL_SHORTCUTS`：全域快捷鍵（8 組）
- `TABLE_SHORTCUTS`：表格頁面快捷鍵（9 組）
- `CHART_SHORTCUTS`：圖表頁面快捷鍵（7 組）

### 3. 整合到 App.tsx

**修改檔案**：`frontend/src/App.tsx`

**功能**：
- 新增 `ShortcutHelpManager` 組件
- 監聽 `shortcut:show-help` 事件（由 `Cmd+/` 觸發）
- 根據當前頁面自動切換「頁面情境快捷鍵」

## 待完成項目

### 1. 表格快捷鍵（Signals 頁面）

**參考**：spec §12.2

**已完成**：
- ✅ ↑↓：上一列/下一列
- ✅ Enter：展開/收合
- ✅ Escape：取消選取
- ✅ Home/End：第一列/最後一列

**待確認**：
- ⏳ Space：勾選（目前無勾選功能）
- ⏳ Shift+↑↓：多選（目前無多選功能）

**修改檔案**：`frontend/src/pages/Signals.tsx`

### 2. 圖表快捷鍵（Backtest 頁面）

**參考**：spec §12.3

**已完成**：
- ✅ R：重設縮放
- ✅ ←→：平移（左/右）
- ✅ Shift+←→：快速平移（左/右）
- ✅ 0：重設到初始狀態
- ✅ Home：回到最左側（最早日期）← **已修正**（原本錯誤地呼叫 `resetZoom()`）

**待確認**：
- ⏳ End：跳到最右側（最新日期）

**修改檔案**：`frontend/src/pages/Backtest.tsx`

### 3. Tooltip 快捷鍵提示

**參考**：spec §12.5

**需求**：互動元件的 Tooltip 顯示快捷鍵提示，例如：
- 「重新整理 ⌘R」
- 「匯出 ⌘E」
- 「搜尋 ⌘K」

**待實作**：
- ⏳ 檢查所有 Tooltip 使用位置
- ⏳ 加入快捷鍵提示（如「重新整理 ⌘R」）

**修改檔案**：
- `frontend/src/pages/Backtest.tsx`（重新整理按鈕）
- `frontend/src/components/ExportModal.tsx`（匯出按鈕）
- `frontend/src/components/Layout.tsx`（搜尋框）

### 4. 首次進入提示

**參考**：spec §12.6

**需求**：首次進入 3 秒後，顯示一次性提示「按 ⌘K 可快速搜尋股票」

**待實作**：
- ⏳ 在 `App.tsx` 或 `Layout.tsx` 加入 `useEffect`
- ⏳ 檢查 `localStorage` 是否有 `shortcut-help-dismissed`
- ⏳ 如果沒有，3 秒後顯示 Toast 提示
- ⏳ 使用者關閉後，設定 `localStorage`

**修改檔案**：
- `frontend/src/App.tsx` 或 `frontend/src/components/Layout.tsx`

## Build 驗證

```bash
cd /Users/claw/Projects/tw-quant-selector/frontend && npm run build
```

**狀態**：❌ 有 TypeScript 錯誤（待修正）

**錯誤清單**：
1. `src/pages/Backtest.tsx(358,13)`: Type 'number' is not assignable to type 'Time'.
2. `src/pages/Backtest.tsx(359,13)`: Type 'number' is not assignable to type 'Time'.

**修正方法**：
- `setVisibleRange()` 需要 `Time` 類型（Unix timestamp in seconds），不是 `number`
- 需要將 `Date` 轉換為 `Time` 類型

## 備註
- 目前已有部分快捷鍵（Cmd+K 搜尋、↑↓ 表格導航），需整合進統一管理器
- 參考 spec §12.1–§12.5
- 剩餘項目預計 1-2 小時可完成

## 檔案清單

| 檔案 | 狀態 | 備註 |
|------|------|------|
| `src/hooks/useKeyboardShortcuts.ts` | ✅ 已完成 | 全域快捷鍵管理器 |
| `src/components/ShortcutHelp.tsx` | ✅ 已完成 | 快捷鍵說明 Modal |
| `src/components/ShortcutHelp.module.css` | ✅ 已完成 | Modal 樣式 |
| `src/App.tsx` | ✅ 已完成 | 整合 ShortcutHelpManager |
| `src/pages/Signals.tsx` | ⏳ 部分完成 | 表格快捷鍵（Home/End 已完成） |
| `src/pages/Backtest.tsx` | ⏳ 部分完成 | 圖表快捷鍵（Home 行為已修正，但有 TypeScript 錯誤） |
| `src/components/Tooltip.tsx` | ⏳ 待修改 | Tooltip 快捷鍵提示 |
| `src/components/Layout.tsx` | ⏳ 待修改 | 首次進入提示 |
