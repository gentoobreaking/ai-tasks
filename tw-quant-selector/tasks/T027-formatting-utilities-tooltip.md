---
github_issue: https://github.com/gentoobreaking/ai-tasks/issues/661
title: 格式化工具與 Tooltip 元件
type: feature
priority: high
status: done
assignee: gemini-3-flash-preview
created: 2026-05-26
updated: 2026-05-26
howto: |
  1. Create frontend/src/utils/format.ts with all number format functions
  2. Create frontend/src/utils/color.ts with change color/icon helpers
  3. Create frontend/src/components/Tooltip.tsx as reusable component
  4. Format functions (spec §2.2):
     - formatPrice(v): integer or 2 decimals (e.g., "543.00")
     - formatReturn(v): +XX.XX% or -XX.XX% (e.g., "+12.34%")
     - formatFactorScore(v): 2 decimals (e.g., "1.23")
     - formatMarketCap(v): shorthand in 億, 1 decimal (e.g., "234.5億")
     - formatVolume(v): shorthand in 萬張 (e.g., "1.2萬張")
     - formatSharpe(v): 2 decimals (e.g., "1.85")
     - formatPercentile(v): 1 decimal + % (e.g., "91.2%")
  5. Color helpers (spec §2.1):
     - colorForChange(v): returns CSS var for bull/bear/neutral/muted
     - trendIcon(v): returns "▲"/"▼"/""
     - bgForExtreme(v): returns bull-dim/bear-dim for >5% moves or null
  6. Tooltip component (spec §3.8):
     - Trigger: show after 300ms hover, hide 150ms after mouse leaves
     - Position: prefer above, flip on overflow
     - Styling: --bg-overlay, 1px --bg-border, radius 6px, padding 8px 12px, font-size 12px, max-width 240px
     - Factor score tooltip format: name, score, percentile, trend direction
  7. Unit tests for all formatters
---

# T027 - Formatting Utilities & Tooltip Component

## 目標
建立集中的數字格式化工具庫、漲跌顏色/圖示輔助函式，以及可復用的 Tooltip 元件，確保全站數字顯示一致。

## 驗收標準
### 格式化工具（format.ts）
- [x] `formatPrice(v)`：股價顯示整數或兩位小數（如 `543.00`），使用 `font-variant-numeric: tabular-nums`
- [x] `formatReturn(v)`：報酬率顯示 `+12.34%` 或 `-5.67%`，固定兩位小數
- [x] `formatFactorScore(v)`：因子分數兩位小數（如 `1.23`）
- [x] `formatMarketCap(v)`：市值縮寫億元一位小數（如 `234.5億`）
- [x] `formatVolume(v)`：成交量縮寫萬張（如 `1.2萬張`）
- [x] `formatSharpe(v)`：Sharpe 等指標兩位小數（如 `1.85`）
- [x] `formatPercentile(v)`：百分位一位小數 + %（如 `91.2%`）
- [x] 所有函式在輸入為 `null` / `undefined` / `NaN` 時回傳 `—`（em dash）

### 顏色輔助（color.ts）
- [x] `colorForChange(v)`：正數回傳 `var(--color-bull-text)`、負數回傳 `var(--color-bear-text)`、零回傳 `var(--text-secondary)`、null 回傳 `var(--text-muted)`
- [x] `trendIcon(v)`：正數回傳 `▲`、負數回傳 `▼`、其餘回傳空字串
- [x] `bgForExtreme(v)`：`> +5%` 回傳 `var(--color-bull-dim)`、`< -5%` 回傳 `var(--color-bear-dim)`、其餘回傳 `transparent`

### Tooltip 元件（Tooltip.tsx）
- [x] 觸發延遲 300ms（懸停後才顯示），消失延遲 150ms
- [x] 位置優先向上，超出視窗時自動反轉
- [x] 外觀：`background: var(--bg-overlay)`、`border: 1px solid var(--bg-border)`、`border-radius: 6px`、`padding: 8px 12px`、`font-size: 12px`、`max-width: 240px`
- [x] Factor score tooltip 格式顯示：名稱、分數、百分位、近4週趨勢方向

### 測試
- [x] 所有格式化函式有對應 unit test（正常值、邊界值、null/NaN）

## 備註
- 參考 spec §2.1 漲跌顏色規則、§2.2 數字顯示規則、§3.8 Tooltip 規格
- 所有頁面元件應從 utils/format.ts 與 utils/color.ts 引用，避免 inline 格式化
