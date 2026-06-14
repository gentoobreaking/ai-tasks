---
github_issue: https://github.com/gentoobreaking/ai-tasks/issues/728
title: CSS State Classes 接入元件動態行為
type: feature
priority: medium
status: done
assignee: OpenCode DeepSeek V4 Flash
created: 2026-05-28
updated: 2026-05-28
howto: |
  1. `.row-new` — Portfolio 加入新股時，對新資料行套用此 class（fadeInDown 動畫）。
  2. `.row-exiting` — Portfolio 刪除持股時，先套用此 class 觸發 fadeOut 動畫，animationend 後再移除 DOM。
  3. `@keyframes valueFlash` — StatCard 的 `animateNumber()` 完成後，對數值 span 套用此 animation 閃爍提示。
  4. `.input-error` — Portfolio 加入表單驗證失敗時，對對應欄位套用紅框。
  5. 所有動畫遵守 `prefers-reduced-motion`。
---

# T073 - CSS State Classes 接入元件動態行為

## 目標
`global.css` 已定義 `.row-new`、`.row-exiting`、`@keyframes valueFlash`、`.input-error` 等狀態類別，但目前無任何元件套用。將這些 CSS class 接入實際使用者互動中。

## 驗收標準
- [x] Portfolio 加入新股時，新資料行套用 `.row-new` fadeInDown 動畫
- [x] Portfolio 刪除持股時，資料行先套用 `.row-exiting` 淡出，`animationend` 後再移出 DOM
- [x] StatCard 數值跳動完成後，數值 div 套用 `value-update`（valueFlash）閃爍一次
- [x] Portfolio 加入表單欄位空白時，套用 `.input-error` 紅框提示，輸入後自動清除
- [x] 所有動畫在 `prefers-reduced-motion` 下停用（global.css 已有）
- [x] TypeScript 編譯無錯誤，`npm run build` 成功

## 備註
- Portfolio 刪除時需等待 `animationend` 事件（~300ms）再更新 state，避免動畫中斷
- StatCard 的 `valueFlash` 可用 `useEffect` 監聽 value prop 變化後 setTimeout 移除 class
