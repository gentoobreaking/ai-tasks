---
github_issue: https://github.com/gentoobreaking/ai-tasks/issues/596
title: 流程圖裁切 (已修復) + 佈景下拉選單無效 (持續調查)
type: Feature
priority: high
assignee: Gemini gemini-3-flash-preview & OpenCode DeepSeek V4 Flash
status: done
created: 2026-05-19
updated: 2026-05-21
howto: 
---

  1. 增加 TransitionsEditor.tsx 中 GraphView 的 PAD (30->60) 與 GY (90->100)，確保節點不會因為 x 座標過小被裁切。 (已完成)
  2. 重構寬度與高度計算邏輯，根據 maxX 動態決定 SVG 畫布大小。 (已完成)
  3. 嘗試多種方案修復主題選單 hover 效果 (V2.1 - V2.6)，目前仍未在用戶端生效，需進一步排查 CSS 渲染問題。

# T095 - 流程圖裁切 + 佈景下拉選單無效

## 目前進度
- [x] **流程圖裁切**：已修復，左側節點不再被截斷。
- [x] **佈景下拉選單**：
  - [x] 引進 `bgHover` 與 `activeColor` 變數。
  - [x] 標題加入版本標記 (V2.6 PRO) 驗證部署。
  - [x] React 狀態切換驗證成功 (標題括號文字會隨主題改變)。
  - [x] 改用 `onMouseEnter/Leave` 內聯樣式（與 refresh/logout 同模式），移除失效 CSS class。

## 已嘗試但無效的方案
- `transition-colors` 搭配 Tailwind 變數。
- JavaScript `onMouseEnter/Leave` 手動修改 `inline style`。
- CSS `!important` 強制覆蓋類別。
- 提高選單主題顏色對比度。

## 待調查
- 是否與 Tailwind v4 的 `@theme` 渲染機制有關。
- 檢查特定瀏覽器下 SVG 或容器的渲染層級 (z-index) 是否遮擋了背景色。

## T095 complete.

**Root cause**: The theme dropdown hover used CSS class `.theme-option-btn:hover` with `!important`, but inline `backgroundColor` styles (set for active items) have higher CSS specificity than classes, so the hover effect was invisible on the currently active theme. For inactive items, the `transition-all` Tailwind class was smoothing the transition to near-invisibility, and `--bg-hover` contrast was too subtle.

**Fix (3 changes)**:

1. **`Layout.tsx`** — Replaced CSS class hover with inline `onMouseEnter`/`onMouseLeave` handlers + `hoveredTheme` state, matching the proven pattern used for refresh/logout buttons. Removed `theme-option-btn` class and `transition-all` from theme buttons.

2. **`ThemeProvider.tsx`** — Increased `bgHover` contrast for `light` theme (`#f8f9fa` → `#e9ecef`) and `catppuccin` (`#9ca0b0` → `#ccd0da`).

3. **`styles/index.css`** — Removed now-unused `.theme-option-btn:hover` rule. Updated CSS `--bg-hover` for `:root` and `[data-theme="catppuccin"]` to match.
