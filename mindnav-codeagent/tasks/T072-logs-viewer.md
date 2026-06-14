---
github_issue: https://github.com/openclawchen8-lgtm/openclaw-tasks/issues/562
title: Logs Viewer
type: Feature
priority: medium
status: done
assignee: Gemini gemini-3-flash-preview
created: 2026-05-18
updated: 2026-05-20
howto: 
---

  1. 在 frontend_api/router_v1.py 實作 /logs 接口，支援 type, level, component, lines 參數。
  2. 實作 _read_log_entries 與 _log_file_stats 輔助函式，支援高效日誌讀取與統計。
  3. 在 frontend-react 建立 LogsPage.tsx，整合上述 API 並提供即時刷新 (Live tailing) 與色彩標示功能。

# T072 - Logs Viewer

## 目標
在 Dashboard 中實現日誌查看功能，支援多檔案切換高等級過濾和即時 tailing。

## 驗收標準
- [x] Log 檔案切換（agent / errors / gateway）
- [x] 等級過濾（ALL / DEBUG / INFO / WARNING / ERROR）
- [x] Component 過濾（all / gateway / agent / tools / cli / cron）
- [x] 行數選擇（50 / 100 / 200 / 500）
- [x] Live tailing（自動刷新）
- [x] Color-coded 輸出（紅色 errors、黃色 warnings、dim debug）
- [x] Timestamp 顯示

## 備註
- 利用現有的 logging 配置
- 考慮使用 Server-Sent Events 或 WebSocket 實現 live tailing
- 避免一次讀取過多行造成前端卡頓
