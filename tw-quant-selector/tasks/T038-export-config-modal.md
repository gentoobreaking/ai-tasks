---
github_issue: https://github.com/gentoobreaking/ai-tasks/issues/716
title: 資料匯出欄位選擇彈窗
type: feature
priority: low
status: done
assignee: gemini-3-flash-preview
created: 2026-05-26
updated: 2026-05-26
howto: |
  1. 在匯出按鈕點擊後顯示 Configuration Modal (spec §5.4)
  2. 允許使用者勾選欲包含在 CSV/JSON 中的欄位
  3. 提供「預設顯示欄位」與「完整進階欄位」兩種預設集
  4. 實作匯出檔案命名規則：tw_signals_YYYYMMDD.csv
---

# T038 - Export Configuration Modal

## 目標
實作規格書 §5.4 定義的匯出設定介面，允許使用者在下載前自定義資料欄位。

## 驗收標準
- [x] 點擊「匯出」後不直接下載，而是開啟設定 Modal
- [x] 使用者可選擇匯出格式：CSV 或 JSON
- [x] 提供欄位清單供勾選（包含目前表格未顯示的隱藏欄位，如市值、原始各項因子值等）
- [x] 實作「全選」與「僅顯示欄位」快速切換
- [x] 點擊「開始匯出」後觸發 API 請求並自動開始檔案下載
- [x] 檔名符合規範：tw_signals_YYYYMMDD.[ext]

## 備註
- 此任務需與 T025 (API 強化) 配合，確保 API 支援動態欄位篩選或回傳完整欄位由前端過濾
