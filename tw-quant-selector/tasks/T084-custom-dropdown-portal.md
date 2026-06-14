---
github_issue: https://github.com/openclawchen8-lgtm/openclaw-tasks/issues/781
title: 自訂 Dropdown 元件 + Portal 渲染
type: feature
priority: low
status: done
assignee: OpenCode DeepSeek V4 Flash
created: 2026-05-29
updated: 2026-05-29
howto: |
  1. 建立可複用的 `Dropdown` 元件（選項清單、開關動畫、鍵盤導航）。
  2. 選單面板使用 `createPortal` 渲染至 `document.body`，避免被 modal `overflow` 或父層截斷。
  3. 逐步取代現有原生 `<select>`：Signals.tsx 策略篩選、Strategy.tsx 大師篩選、ExportModal.tsx 格式選擇。
  4. 樣式與現有 design system 一致（`--bg-surface`、`--bg-elevated`、`--radius-btn`）。
---

# T084 - 自訂 Dropdown 元件 + Portal 渲染

## 目標
目前表單下拉全使用原生 `<select>`，樣式受限且在不同 OS 渲染不一致。建立自訂 `Dropdown` 元件搭配 `Portal` 渲染選單面板，解決：
- Modal 內下拉面板不被 `overflow: hidden` 截斷
- 統一風格（與 `--bg-surface` / `--bg-elevated` 等 token 一致）
- 支援鍵盤上下選取與 Enter 確認

## 驗收標準
- [ ] `Dropdown` 元件支援 `options: {value, label}[]`、`value`、`onChange` props
- [ ] 選單面板透過 `createPortal` 渲染至 `document.body`（`position: fixed` 搭配定位計算）
- [ ] 點擊外部自動關閉（`useEffect` 监听 `mousedown`）
- [ ] 鍵盤導航：↑↓ 移動選項、Enter 確認、Esc 關閉
- [ ] 取代 Signals.tsx 策略篩選 `<select>`
- [ ] 取代 Strategy.tsx 大師篩選 `<select>`
- [ ] 取代 ExportModal.tsx 格式 `<select>`
- [ ] TypeScript 編譯無錯誤，`npm run build` 成功

## 備註
- 可沿用 T083 的 `Portal` 元件
- 選單定位邏輯參考 T083 Tooltip 的 `getBoundingClientRect` 計算
- 不需支援多選（multi-select），第一版只做單選