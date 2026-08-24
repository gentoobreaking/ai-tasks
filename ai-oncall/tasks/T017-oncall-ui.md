---
github_issue: N/A
title: oncall-ui 唯讀 Web 服務
type: feat
priority: medium
status: done
depends_on:
- T014
assignee: "pi with opencode/x-preview-f-free"
created: 2026-08-24
updated: 2026-08-24
---

# T017 - oncall-ui 唯讀 Web 服務

## 目標
FastAPI + Jinja2 + htmx 唯讀網頁：`/incidents`（狀態篩選/搜尋）、`/incidents/{id}`
（時間線+分診報告+批准紀錄+postmortem 預預覽+雜湊鏈徽章）、`/runbooks`（清單+執行統計）。
綁 127.0.0.1、僅 GET、對外經反向代理認證（spec.md §2.5 安全邊界）。

## 驗收標準
- [x] 三張頁面齊備；資料源僅 readapi（整合測試斷言無直連 SQLite）
- [x] 僅 GET 路由白名單測試（spec.md §5 標準 6）
- [x] htmx + 極簡 CSS；模板不編譯進 binary（Python 服務）

## 執行紀錄（2026-08-24 稽核）
- 已達成 3 項並打勾。
- **未竟事項**：無。
- 補充（證據）：ui/tests/test_t017_ui.py：三頁面渲染（清單/搜尋無命中/詳情 Timeline+Triage/runbooks+Stats）；AST 掃描 ui 原始碼無 sqlite3/oncall_core import；路由 methods ⊆ {GET,HEAD} 白名單；base.html 引 htmx CDN＋static/style.css。
