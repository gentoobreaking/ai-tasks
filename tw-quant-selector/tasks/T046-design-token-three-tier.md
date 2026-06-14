---
github_issue: https://github.com/gentoobreaking/ai-tasks/issues/689
title: Design Token Three-Tier Architecture
type: refactor
priority: high
status: done
assignee: OpenCode DeepSeek V4 Flash
created: 2026-05-27
updated: 2026-05-27
howto: |
  1. 在 variables.css 建立 Primitive Tokens（_emerald-* / _crimson-* / _ink-* / _space-* / _dur-* / _ease-*）。
  2. 建立 Semantic Tokens（color-positive / color-negative / color-bg-* / color-text-* / space-component-* / dur-* / ease-*）。
  3. 所有現有 CSS 變數（--bg-base, --color-bull 等）改為引用新的 Semantic Tokens。
  4. 建立 Component Tokens 模式：元件作用域變數覆寫（如 signal-table 自訂行高）。
---

# T046 - Design Token Three-Tier Architecture

## 目標
將現有 CSS 變數重構為三層架構：Primitive Tokens（原始值）、Semantic Tokens（語意代幣）、Component Tokens（元件代幣），確保變數命名一致性與可維護性。

## 驗收標準
- [ ] `variables.css` 中定義完整的 Primitive Tokens（色彩/間距/時間/easing 原始值，前綴 `--_`）
- [ ] 定義 Semantic Tokens 並確保所有現有元件只引用這層
- [ ] 舊變數別名保留相容（如 `--color-bull` → `--color-positive` 以 `var()` 橋接）
- [ ] Component Tokens 模式：SignalTable、KPICard 等透過作用域變數覆寫外觀
- [ ] 所有前端頁面 build 無錯誤，視覺無回歸

## 備註
- 逐步遷移，不一次性改全部檔案
- 參考 spec §1.2–1.4 的完整變數名稱
