---
github_issue: https://github.com/gentoobreaking/ai-tasks/issues/734
title: color.ts 工具函式導入頁面取代手寫顏色邏輯
type: refactor
priority: low
status: done
assignee: OpenCode DeepSeek V4 Flash
created: 2026-05-28
updated: 2026-05-29

## 驗收標準
- [x] `StockDetail.tsx` 使用 `colorForChange()` 取代手寫 `style={{ color: 'var(--color-bull-text)' }}`
- [x] `Signals.tsx` 使用 `trendIcon()` / `colorForChange()` 取代手寫漲跌顏色/圖示邏輯
- [x] `Dashboard.tsx` 同上
- [x] `Portfolio.tsx` 使用 `trendIcon()` 取代損益列漲跌標示
- [x] `SignalRowDetail.tsx` 使用 `FACTOR_LABELS` 取代 `f === 'momentum' ? '動能' : ...`
- [x] TypeScript 編譯無錯誤，`npm run build` 成功

## 實作紀錄 (2026-05-29)
- `StockDetail.tsx` — 匯入 `colorForChange`，取代 line 73 手寫顏色 CSS var
- `Signals.tsx` — 匯入 `colorForChange` / `trendIcon`，取代 line 193-194 手寫漲跌顏色/箭頭判斷
- `Dashboard.tsx` — 同上，取代 lines 117-118
- `Portfolio.tsx` — 匯入 `trendIcon`，取代 3 處損益列漲跌箭頭（`pnl >= 0 ? '▲' : '▼'` → `trendIcon(pnl) || '—'`）
- `SignalRowDetail.tsx` — 匯入 `FACTOR_LABELS`，取代 factor 中文名三目運算
howto: |
  1. `color.ts` 提供 `colorForChange()`、`trendIcon()`、`bgForExtreme()`、`FACTOR_COLORS`、`FACTOR_LABELS`。
  2. 目前各頁面重複手寫 `v > 0 ? '▲' : v < 0 ? '▼' : ''` 和 `style={{ color: 'var(--color-bull-text)' }}`。
  3. 在 StockDetail.tsx、Signals.tsx、Dashboard.tsx、Portfolio.tsx 中將這些重複邏輯改為呼叫 `color.ts` 的函式。
  4. 確保行為完全一致（視覺無回歸）。
---

# T080 - color.ts 工具函式導入頁面取代手寫顏色邏輯

## 目標
`utils/color.ts` 已定義 `colorForChange()`、`trendIcon()`、`bgForExtreme()`、`FACTOR_COLORS`、`FACTOR_LABELS` 等工具函式，但未被任何頁面匯入。各頁面（StockDetail、Signals、Dashboard、Portfolio）手寫重複的漲跌顏色/圖示邏輯。將這些重複程式碼統一改用 `color.ts`。

## 備註
- 純 refactor，不改行為，只抽共用函式
- `colorForChange()` 回傳 CSS var() string，使用時機為 `style={{ color: colorForChange(v) }}`
