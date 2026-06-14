---
github_issue: https://github.com/gentoobreaking/ai-tasks/issues/729
title: 後端 signals/calendar API 接上 Signals 日期選擇器
type: feature
priority: low
status: done
assignee: OpenCode DeepSeek V4 Flash
created: 2026-05-28
updated: 2026-05-29
howto: |
  1. 檢視 `GET /api/v1/signals/calendar` 回傳哪些日期有選股訊號資料。
  2. 在 `Signals.tsx` 的日期 input 上方或附近顯示可用日期清單或下拉選單。
  3. 點擊某日期時，以 `GET /api/v1/signals/{date}` 載入該日資料。
  4. 無資料的日期在日曆上標灰或不可選。
  5. `client.ts` 新增 `fetchSignalCalendar()` 和 `fetchSignalsByDate(date)` 方法。
---

# T075 - 後端 signals/calendar API 接上 Signals 日期選擇器

## 目標
後端已實作 `GET /api/v1/signals/calendar`（哪些日期有訊號）和 `GET /api/v1/signals/{signal_date}`（指定日期的訊號），但前端 Signals 頁面僅顯示最新一日資料，無法瀏覽歷史訊號。將 API 接入實現日期切換功能。

## 驗收標準
- [x] `client.ts` 新增 `fetchSignalCalendar(): Promise<string[]>` 和 `fetchSignalsByDate(date: string, strategy?: string, includeEtf?: boolean)`
- [x] Signals 頁面的日期 input 改為可互動（移除 `readOnly`，新增 `onChange` + 左右導覽按鈕）
- [x] 日曆上只標記有資料的日期（使用 `<datalist>` 列出可用日期，`min`/`max` 限制範圍，`onChange` 過濾不在 calendar 中的值）
- [x] 切換日期時重新載入該日的訊號資料，顯示 BaseTable loading skeleton
- [x] 選擇無資料的日期顯示 `{selectedDate} 沒有符合條件的選股結果`
- [x] URL query string 同步 `?date=2026-05-27`（優先取 URL 指定日期，無則預設最新）
- [x] TypeScript 編譯無錯誤，`npm run build` 成功

## 備註
- 日曆 UI 可使用瀏覽器原生 `<input type="date">` 並動態設定 `min`/`max`，或實作簡易日期導覽（上/下一天按鈕）
- 策略篩選和排序功能應與日期切換疊加運作

## 實作紀錄 (2026-05-29)
### 前端改動
- `client.ts` — 新增 `fetchSignalCalendar()`（回傳 `string[]`）與 `fetchSignalsByDate(date, strategy?, includeEtf?)`
- `Signals.tsx` — 完整重寫資料流：
  - 分離 calendar 載入（`calLoading`）與 signals 載入（`loading`）狀態
  - 首次載入同時 fetch calendar 清單，URL 有 `?date=` 且有效則優先使用，否則取最新日期
  - `onChange` 只接受 `dateSet` 中的值（有資料的日期才可選）
  - 新增 ◀/▶ 按鈕（`goPrevDay`/`goNextDay`），邊界自動 disabled
  - 日期切換或策略切換時觸發 `fetchSignalsByDate`，顯示 `BaseTable` 的 loading skeleton
  - URL query string 同步 `sort`, `dir`, `strategy`, `date`, `etf`, `stock`
  - 移除對 `fetchLatestSignals` 的依賴（完全改用 `fetchSignalsByDate`）
- `Signals.module.css` — 新增 `.dateNav`（flex row）和 `.navBtn` 樣式（hover/disabled）
- 移除 `displayData` 中間變數（直接用 `allItems`）
