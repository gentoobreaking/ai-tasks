---
github_issue: N/A
title: 底部輸入 + 中斷 + 命令面板（UI-4）
type: feature
priority: high
status: done
depends_on: [T003]
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-13
updated: 2026-08-13
---

# T004 - 底部輸入 + 中斷 + 命令面板（UI-4）

## 目標

依 spec §45.1（原則 2：鍵盤優先）/ §45.4 / §45.6（UI-4）：底部輸入列（`Enter` 送出、`esc` 中斷、`ctrl+K` 開啟命令面板），CommandPalette 搜尋與過濾指令（select / verify / research / strategy / logs / sandbox check）。

## 驗收標準

- [x] InputBar：`Enter` 建立 task、`esc` 取消目前執行、`ctrl+K` 開啟面板
- [x] CommandPalette：輸入過濾、Enter 執行第一筆、Escape 關閉
- [x] Command 型別（run / select / cancel / verify / research / logs / sandbox-check / strategy）齊備

## 備註

- 目前 `verify / research / strategy / logs` 指令僅刷新清單（對應 API 於 T008/T010/T016 提供後接上）。
- `/` 指令前綴（§45.4）與方向鍵瀏覽歷史為後續增強項（可併入 T025）。
