---
github_issue: https://github.com/gentoobreaking/ai-tasks/issues/559
title: Frontend React 基礎架構
type: Feature
priority: high
status: done
assignee: OpenCode MiniMax-M2.7
created: 2026-05-18
updated: 2026-05-18
howto: null
---

# T069 - Frontend React 基礎架構

## 目標
將 mindnav-codeagent 的前端從 vanilla HTML/JS 遷移到 React 19 + Vite + Tailwind CSS v4 + shadcn/ui 風格组件。建立可擴展的前端架構，支援未來的 Dashboard 功能模組。

## 驗收標準
- [x] 初始化 Vite + React 19 項目
- [x] 配置 Tailwind CSS v4
- [x] 建立 theme system（CSS variables，支援 light/dark）
- [x] 建立基本 layout 元件（Sidebar、Header、MainContent）
- [x] 建立 API client 封裝（fetch + error handling）
- [x] 建立 React Router 路由結構
- [x] 遷移現有登入頁面到 React
- [x] 遷移現有專案總覽頁面到 React
- [x] 可以同時運行新舊前端（開發過渡期）

## 備註
- 現有 vanilla HTML/JS 保持在 `frontend/` 不變，新 React 放到 `frontend-react/`
- 考慮使用 shadcn/ui 風格的組件但不自帶完整 shadcn/ui 依赖
- 建議先建立好目錄結構和類型定義
