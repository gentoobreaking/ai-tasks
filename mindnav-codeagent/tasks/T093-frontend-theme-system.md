---
github_issue: https://github.com/gentoobreaking/ai-tasks/issues/601
title: 前端主題系統（5 themes + persistence）
type: Feature
priority: medium
status: done
assignee: OpenCode DeepSeek V4 Flash
created: 2026-05-18
updated: 2026-05-18
howto: null
---

# T093 - 前端主題系統

## 目標
為 Dashboard 加入多主題支援，可切換佈景並保持設定。

## 驗收標準
- [x] 5 個預設主題：light / dark / nord / dracula / catppuccin
- [x] 主題定義在 CSS custom properties（`--bg-page`, `--bg-card`, `--text-primary` 等）
- [x] 透過 `data-theme` attribute 切換
- [x] `ThemeProvider` context（React Context + localStorage fallback）
- [x] 右上角下拉選單切換主題
- [x] 設定持久化至 `config/agents.yaml`（frontend.theme）+ localStorage
- [x] Layout 背景、文字、卡片顏色改用 CSS 變數

## 備註
- 主題不影響 Tailwind utility classes 產生的顏色（硬編碼 hex 仍保持原色），僅影響 `var(--*)` 引用的區域
- 如需讓所有元件跟隨主題，需逐步將 `bg-[#...]` 改為 `var(--bg-*)`
