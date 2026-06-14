---
github_issue: https://github.com/openclawchen8-lgtm/openclaw-tasks/issues/696
title: Data Density System
type: feature
priority: low
status: done
assignee: OpenClaw MiniMax M2.7 / 碼農1號 + DeepSeek V4 Flash
created: 2026-05-27
updated: 2026-05-28
howto: |
  1. 定義三種密度模式的行高/字型大小/間距值（CSS 變數）。✅
  2. 切換按鈕（右上角三橫線圖示），設定存 localStorage。✅
  3. 透過 data-density attribute 控制全局密度。✅
  4. 影響範圍：表格行高、字型大小、因子橫條高度、KPI卡片內距、頁面 padding。✅
  5. 不影響：圖表、Modal、Tooltip、按鈕、header/sidebar。✅
---

# T053 - Data Density System

## 目標
實作三種資料密度模式（Comfortable / Compact / Dense），讓使用者可以切換表格與卡片的顯示密度，滿足不同使用場景。

## 驗收標準
- [x] 三種模式數值：Comfortable(row-h:48px, fs:13px)、Compact(36px,12px)、Dense(28px,11px)
- [x] 切換按鈕（圖示三橫線不同間距），設定存 localStorage
- [x] 透過 `<body data-density="...">` 或容器 attribute 控制
- [x] 影響 table row height、font-size、factor bar height、KPI padding、page padding
- [x] 不影響 charts、modals、tooltips、buttons、sidebar/header
- [x] 每個頁面可獨立設定密度（或全域統一）

## 實作內容

### 1. CSS 變數定義

在 `variables.css` 新增：

```css
/* Default: Comfortable */
--density-row-height: 48px;
--density-font-size: 13px;
--density-cell-padding: 16px;
--density-card-padding: 16px;
--density-page-padding: 24px;
--density-factor-bar-height: 24px;
--density-gap: 16px;

/* Compact Mode */
[data-density="compact"] { ... }

/* Dense Mode */
[data-density="dense"] { ... }
```

### 2. DensityToggle 組件

**位置**：`/components/DensityToggle.tsx`

**功能**：
- 三種模式循環切換
- 圖示顯示不同間距橫線
- localStorage 持久化
- 更新 `<body data-density>` 屬性

**圖示**：
- Comfortable: 3 條粗線（間距大）
- Compact: 4 條細線（間距中）
- Dense: 7 條細線（間距小）

### 3. 整合至 Sidebar

在 Sidebar footer 區域新增 DensityToggle 按鈕，expanded 時顯示。

### 4. Signals 頁面更新

- 移除舊的 `dense` 狀態（class-based）
- 改用全域 `data-density` 控制
- 表格行高自動響應 CSS 變數

## 三種模式數值

| 模式 | 行高 | 字型 | cell padding | card padding | factor bar |
|------|------|------|--------------|--------------|------------|
| Comfortable | 48px | 13px | 16px | 16px | 24px |
| Compact | 36px | 12px | 12px | 12px | 20px |
| Dense | 28px | 11px | 8px | 8px | 16px |

## Build 驗證

```bash
cd /Users/claw/Projects/tw-quant-selector/frontend && npm run build
```

✓ built in 305ms — 所有頁面編譯成功

## 技術細節

### CSS 變數映射

```css
.table th { padding: var(--space-2) var(--density-cell-padding); }
.table td { padding: var(--space-2) var(--density-cell-padding); }
.dataRow { height: var(--density-row-height); }
```

### localStorage

- Key: `tw-quant-density`
- Value: `'comfortable'` | `'compact'` | `'dense'`

### 不影響的元素

- 圖表（lightweight-charts）
- Modal（ExportModal、Toast）
- Tooltip（Tooltip.module.css）
- 按鈕（.actionBtn、.toggle）
- Sidebar/Header

## 備註
- Signals 頁面原有的 `dense` toggle 已整合為三模式系統
- 使用者可隨時切換，設定會保存
- 參考 spec §9.1–9.3
