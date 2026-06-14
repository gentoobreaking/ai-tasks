---
github_issue: https://github.com/gentoobreaking/ai-tasks/issues/725
title: Toast 通知系統接入各頁面
type: feature
priority: high
status: done
assignee: OpenCode DeepSeek V4 Flash
created: 2026-05-28
updated: 2026-05-28
howto: |
  1. 確認 `Toast.tsx` 已匯出 `addToast()` / `useToast()`，`App.tsx` 已掛載 `<ToastProvider>`。
  2. 找出所有頁面中手寫的 `setStatusMsg(...)` / `alert(...)` / `console.error(...)`。
  3. 將成功/失敗/資訊訊息改為 `addToast({ type, message })` 呼叫。
  4. Toast 支援三種 type：success、error、info，並在 3 秒後自動消失。
  5. 確保 Toast 的 z-index 正確（高於所有其他 UI 層）。
---

# T070 - Toast 通知系統接入各頁面

## 目標
`Toast.tsx` 已定義但沒有任何頁面呼叫 `addToast()` / `useToast()`。目前所有狀態訊息（儲存成功、匯出完成、API 錯誤）都用 `setStatusMsg` 內聯訊息，不會自動消失。需將所有訊息改為 Toast 通知。

## 驗收標準
- [x] `addToast(msg, severity)` API 已實作，支援自動消失（low/medium 5s, high 10s, critical 永久）
- [x] 以下頁面已接入 Toast：
  - [x] `Settings.tsx`（載入失敗、儲存成功/失敗、測試告警成功/失敗）
  - [x] `Portfolio.tsx`（加入持股成功、價格查詢失敗、刪除持股）
  - [x] `Signals.tsx`（匯出完成/失敗）
  - [x] `Dashboard.tsx`（重新整理載入失敗）
- [x] Z-index 正確（Toast 層高於其他 UI）
- [x] TypeScript 編譯無錯誤，`npm run build` 成功

## 備註
- `ToastProvider` 已在 `App.tsx` 掛載，只需在各頁面呼叫 `useToast()` 或匯入 `addToast()` 即可
- 現有 `setStatusMsg` 程式碼可先保留註解作為還原點
