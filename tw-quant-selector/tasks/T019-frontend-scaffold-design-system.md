---
github_issue: https://github.com/gentoobreaking/ai-tasks/issues/653
title: 前端專案初始化與設計系統
type: feature
priority: high
status: done
assignee: gemini-3-flash-preview
created: 2026-05-26
updated: 2026-05-26
howto: |
  1. Create React + Vite + TypeScript project under ~/Projects/tw-quant-selector/frontend/
  2. Install dependencies: react-router-dom, zustand, @tanstack/react-query, lightweight-charts, recharts, @tanstack/react-table
  3. Implement design system CSS variables (from spec §2.1-2.4) as a global CSS file
  4. Create sidebar navigation component (collapsible, 240px → 56px) with all routes
  5. Set up React Router v6 routes: /, /signals, /signals/:stock_id, /portfolio, /backtest, /backtest/:run_id, /strategy, /monitor
  6. Create root layout with sidebar + content area
  7. Add font imports (IBM Plex Mono + Syne from Google Fonts)
  8. Verify: npm run dev shows sidebar with all nav items, clicking switches pages
---

# T019 - Frontend Scaffold & Design System

## 目標
建立 React 前端專案的基底結構，包括專案初始化、設計系統（色彩/字型/間距/Style Token）、Sidebar 導航與路由框架，讓後續頁面開發可直接基於此結構進行。

## 驗收標準
- [x] `npm run dev` 可啟動開發伺服器，顯示 sidebar + 空白內容區
- [x] Sidebar 包含所有導航項目：今日總覽、選股訊號、投組追蹤、回測分析、策略設定、資料監控
- [x] Sidebar 可收合至 56px（僅顯示圖示），展開為 240px（顯示圖示+文字）
- [x] 路由正確對應：`/` → Dashboard，`/signals` → Signals，`/signals/:id` → StockDetail，`/portfolio` → Portfolio，`/backtest` → Backtest，`/strategy` → Strategy，`/monitor` → Monitor
- [x] 所有頁面元件皆為佔位符（Placeholder），後續任務逐步實作
- [x] CSS Variables 已定義完整（背景5層、文字4層、漲跌色、因子色、間距、圓角）
- [x] 字型設定正確：數字用 IBM Plex Mono（tabular-nums），介面用 Syne
- [x] 底部固定顯示「最後更新時間」與「資料狀態」
- [x] Sidebar 的「資料監控」按鈕在有告警時顯示紅色圓點（alert red dot，spec §1.2）
- [x] CSS 斷點變數已定義：xl 1440px、lg 1024px、md 768px、sm <768px（spec §6.1）
- [x] Sidebar 在 md 以下自動收合（spec §6.2）
- [x] tabular-nums 已設為全域樣式（所有數字自動等寬）

## 備註
- 保持與現有 FastAPI 後端的開發伺服器獨立
- CSS Modules + CSS Variables（不使用 Tailwind，依 spec §9.1）
- 參考 spec §1.2 導航結構、§2 視覺設計系統
