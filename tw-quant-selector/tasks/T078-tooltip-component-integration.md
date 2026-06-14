---
github_issue: https://github.com/openclawchen8-lgtm/openclaw-tasks/issues/732
title: Tooltip 元件接入頁面互動提示
type: feature
priority: low
status: done
assignee: OpenCode DeepSeek V4 Flash
created: 2026-05-28
updated: 2026-05-29
howto: |
  1. 檢視 `Tooltip.tsx` 的 API（`<Tooltip content="...">children</Tooltip>`），確認 hover 定位邏輯。
  2. 在 Settings.tsx 的門檻輸入欄位（PL_THRESHOLD / PL_PERCENT_THRESHOLD）旁加入提示。
  3. 在 Portfolio.tsx 的門檻設定面板各欄位旁加入提示。
  4. 在 Signals.tsx 的因子欄名（動能/價值/品質/成長）加入因子說明提示。
  5. 確保 Tooltip 不會超出視窗外（使用 position: fixed 搭配 viewport 邊界檢測）。
---

# T078 - Tooltip 元件接入頁面互動提示

## 目標
`Tooltip.tsx` 已定義 hover 提示元件，但從未被任何頁面匯入。將 Tooltip 接入 Settings、Portfolio、Signals 等頁面的欄位與標籤，提供額外說明資訊改善 UX。

## 驗收標準
- [x] `Tooltip` 被 Settings、Portfolio、Signals 三個頁面匯入使用
- [x] Settings 門檻欄位（PL_THRESHOLD / PL_PERCENT_THRESHOLD）旁有 Tooltip 說明
- [x] Portfolio 門檻設定面板（金額/百分比門檻）旁有 Tooltip 說明
- [x] Signals 表格欄名（動能/價值/品質/成長）hover 顯示因子公式說明
- [x] Tooltip 不超出 viewport 邊界（新增 viewport 邊界檢測 + flip 邏輯）
- [x] Tooltip 在 mobile 上不阻礙操作（300ms delay 顯示 + 150ms delay 隱藏，觸控時 onFocus/onBlur 自動處理）
- [x] TypeScript 編譯無錯誤，`npm run build` 成功

## 備註
- 說明文字內容：動能（近 3/6/12 月報酬）、價值（本益比/淨值比/殖利率）、品質（ROE/毛利率/負債比）、成長（營收年增/EPS 年增）
- 參考 spec §9.4 Tooltip guidelines

## 實作紀錄 (2026-05-29)
### Tooltip 元件增強
- `Tooltip.tsx` — 新增 viewport 邊界檢測：`useEffect` 監聽工具現位置，若 `rect.top < 4` 則自動 flip 至下方（`flip` state + `.flip` CSS class）
- `Tooltip.module.css` — 新增 `.flip` 樣式（`bottom: auto; top: calc(100% + offset)`，箭頭反轉）

### Settings.tsx
- 匯入 `Tooltip`
- PL_THRESHOLD 標籤包裹 `<Tooltip content="投資組合中單一持股的累計損益達到此絕對金額時觸發通知...">`
- PL_PERCENT_THRESHOLD 標籤包裹 `<Tooltip content="投資組合中單一持股的累計損益百分比達到此值...">`
- `SettingInput` 的 `label` prop 型別從 `string` 改為 `ReactNode`

### Portfolio.tsx
- 匯入 `Tooltip`
- 金額門檻標籤包裹 `<Tooltip content="單一持股累計損益達到此金額時觸發通知...">`
- 百分比門檻標籤包裹 `<Tooltip content="單一持股損益百分比達到此值時觸發通知...">`

### Signals.tsx
- 匯入 `Tooltip`
- 新增 `FACTOR_TOOLTIPS` 字典（momentum/value/quality/growth 各一段說明）
- `makeFactorCol` 的 `header` 從純字串改為 `() => <Tooltip content={FACTOR_TOOLTIPS[key]}>{label}</Tooltip>`
