---
github_issue: https://github.com/openclawchen8-lgtm/openclaw-tasks/issues/665
title: 匯出強化
type: feature
priority: medium
status: done
assignee: gemini-3-flash-preview
created: 2026-05-26
updated: 2026-05-26
howto: |
  1. Add JSON export endpoint to backend: GET /api/v1/signals/export.json (spec §5.4)
  2. Add column selection modal component (frontend/src/components/ExportModal.tsx)
     - Checkbox list of all columns (visible + hidden)
     - Default: all visible columns pre-selected
     - Confirm button triggers download
  3. Add export format dropdown (CSV / JSON) in Signals and Dashboard pages
  4. Implement CSV download in frontend: fetch blob, create download link
  5. Implement JSON download with metadata header
  6. Filename format: tw_signals_YYYYMMDD.csv / tw_signals_YYYYMMDD.json
---

# T031 - Export Enhancement (JSON + Column Selection)

## 目標
強化匯出功能，支援 JSON 格式匯出（含元資料）、欄位選擇 Modal，以及一致的檔案命名規範。

## 驗收標準
- [x] 後端 `GET /api/v1/signals/export.json` 回傳 JSON 格式，含 `meta`（generated_at、data_as_of、request_id）與 `data`（訊號陣列）
- [x] `GET /api/v1/signals/export.csv` 使用正確檔名格式 `tw_signals_YYYYMMDD.csv` 下載
- [x] 前端匯出下拉選單提供 CSV / JSON 格式選擇
- [x] 前端匯出 Modal 顯示可選欄位清單（checkbox）：預設選中所有可見欄位，可額外加入隱藏欄位（市值等）
- [x] JSON 匯出的資料結構符合 frontend Signal interface（spec §9.2）
- [x] 匯出按鈕在 Dashboard 與 Signals 頁面皆可使用
- [x] 匯出過程顯示 loading 狀態，完成後瀏覽器自動下載

## 備註
- 參考 spec §5.4 資料匯出規格、§9.2 Signal interface
- 可合併至 T025，若 T025 尚未開始可將 AC 併入
