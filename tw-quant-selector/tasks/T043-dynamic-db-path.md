---
github_issue: https://github.com/openclawchen8-lgtm/openclaw-tasks/issues/721
title: 動態資料庫路徑配置與重新連線
type: feature
priority: low
status: done
assignee: gemini-3-flash-preview
created: 2026-05-26
updated: 2026-05-26
howto: |
  1. 在設定頁面新增「資料庫路徑」輸入框。
  2. 後端實作 `POST /api/v1/settings/db-path` 端點。
  3. 更新後端 Database 模組，支援動態關閉舊連線並開啟新路徑連線。
  4. 實作安全性驗證，防止 Path Traversal 攻擊。
---

# T043 - Dynamic DB Path Configuration & Backend Reconnection

## 目標
允許使用者從前端動態修改 DuckDB 的存儲路徑，並讓後端自動切換連線，提升系統靈活性。

## 驗收標準
- [x] 前端設定頁面可輸入新的資料庫絕對路徑。
- [x] 更改路徑後，後端需執行：
    1. 驗證新路徑合法性（目錄是否存在、是否有權限）。
    2. 關閉當前 DuckDB 連線。
    3. 以新路徑重新初始化/開啟資料庫。
    4. 回傳切換成功訊息。
- [x] 若切換失敗，應自動回退 (Rollback) 至原路徑連線。
- [x] 安全性：禁止輸入敏感目錄（如 `/etc`, `/root`），僅限指定的資料夾或專案目錄下。
- [x] 啟動時仍優先使用 `.env` 中的 `DUCKDB_PATH`，若設定過動態路徑，可存儲於一個獨立的小型 config 檔中。

## 備註
- **風險**：動態更改 DB 路徑可能導致當前正在執行的排程或回測失敗，需加入執行中檢查。
- **安全警告**：這是一個具備高風險的功能，必須有嚴格的路徑過濾邏輯。
