---
github_issue: https://github.com/openclawchen8-lgtm/openclaw-tasks/issues/660
title: 可複用 BaseTable 表格元件
type: feature
priority: high
status: done
assignee: gemini-3-flash-preview
created: 2026-05-26
updated: 2026-05-26
howto: |
  1. Create frontend/src/components/BaseTable.tsx using @tanstack/react-table v8
  2. Style header: --bg-overlay bg, font-size-sm, --text-secondary, font-weight 500
  3. Row height: 48px default, 36px dense mode (toggle via prop)
  4. Divider: border-bottom 1px solid --bg-border, hover: --bg-elevated 100ms transition
  5. Focused row: border-left 2px solid --color-accent
  6. Sortable columns: click header toggles ▲/▼/──, single-column only, state in URL query string
  7. Keyboard: ↑↓ move focus row, Enter expand inline detail, Esc collapse
  8. Group divider row type (ETF/stock separator)
  9. Click-to-expand inline detail slot via renderRowDetail prop
  10. Virtualization via @tanstack/react-table for >100 rows
  11. Built-in skeleton loading (rows count prop) + empty state slot
  12. WCAG: focus indicators, aria roles, keyboard support
  13. Exact column widths via column meta.width config
---

# T026 - Reusable BaseTable Component

## 目標
建立可複用的 BaseTable 共用元件，統一所有頁面的表格樣式與行為（排序、鍵盤操作、分組線、行展開、虛擬化），並被 Dashboard、Signals、Backtest 等其他任務引用。

## 驗收標準
- [x] 表頭樣式正確：`background: var(--bg-overlay)`、`font-size: var(--font-size-sm)`、`color: var(--text-secondary)`、`font-weight: 500`
- [x] 表行高度可切換（48px 預設 / 36px 密集模式）
- [x] 分隔線使用 `border-bottom: 1px solid var(--bg-border)`，懸停時 `background: var(--bg-elevated)`，transition 100ms
- [x] 焦點行顯示左側 `border-left: 2px solid var(--color-accent)`
- [x] 奇偶行不加不同背景色
- [x] 排序：點擊欄標頭切換排序（單欄位），排序圖示為 ▲ 升序 / ▼ 降序 / ── 未排序，排序狀態存於 URL query string
- [x] 鍵盤操作：↑↓ 移動焦點行，Enter 展開行內詳情，Esc 收起
- [x] 支援分組分隔線（ETFs／個股分組）
- [x] 點擊行可展開下方 inline detail slot（透過 `renderRowDetail` prop 自訂內容）
- [x] 超過 100 筆資料時自動啟用虛擬化（TanStack Table v8）
- [x] 內建骨架載入（skeleton rows）與空狀態插槽
- [x] 支援精確欄位寬度設定（透過 column meta.width）
- [x] WCAG：所有互動元素可 focus，正確的 aria 角色
- [x] 無相依於特定頁面邏輯，為純展示元件

## 備註
- 參考 spec §3.2 SignalTable 欄位寬度、§3.7 通用表格規格、§5.3 排序行為、§7 鍵盤操作
- 此元件應被 T020、T021 引入取代 inline table 實作
