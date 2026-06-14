---
github_issue:https://github.com/gentoobreaking/ai-tasks/issues/635
type: Feature
priority: P1
status: done
assignee: OpenCode DeepSeek V4 Flash
created: 2026-05-21
updated: 2026-05-21
howto: |
  1. 以 Vue SFC 建立 static site 在 ~/Projects/mindnav-codeagent/pages/
  2. 使用 gh-pages 部署
  3. 產品說明、使用說明、架構說明等內容
---

# T122 - 建立產品官方頁面 (gh-pages static site)

## 目標
在 `~/Projects/mindnav-codeagent/pages` 建立 mindnav-codeagent 的產品官方靜態頁面，使用 Vue 或 React 開發，透過 GitHub Pages 部署。

## 驗收標準
- [x] 使用 React + Vite 建立單頁應用
- [x] 頁面包含：產品說明、使用說明、架構說明
- [ ] 部署至 GitHub Pages（需設定 gh-pages token 後執行 npm run deploy）
- [x] 所有頁面支援響應式設計 (RWD)
- [x] 支援中英文雙語切換
- [x] 需有架構圖 (ASCII diagram)

## 頁面結構

### 首頁 — 產品說明
- Hero section: 專案名稱 + 一句話定位
- 核心功能列表（多 agent 協作、DAG 任務分解、Kanban 看板、安全審計等）
- CTA 按鈕連結到使用說明

### 使用說明
- 安裝方式（pip install）
- 快速開始範例
- agent.yaml 配置說明
- 常用指令

### 架構說明
- 整體架構圖（Supervisor → Agents → Tools 層級關係）
- 資料流說明
- 技術棧清單（Python, LangGraph, LangChain, Redis 等）

### 其他
- GitHub 連結
- 授權條款

## 技術選擇
- Vue 3 + Vite（輕量、易維護）
- 或 React + Vite
- gh-pages 指令部署
- Mermaid.js 繪製架構圖

## 備註
- 不引入後端，純靜態頁面
- favicon 可省略或使用預設圖示