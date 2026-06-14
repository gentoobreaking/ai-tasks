---
github_issue: https://github.com/gentoobreaking/ai-tasks/issues/718
title: 損益監控告警後端設定與 API
type: feature
priority: high
status: done
assignee: gemini-3-flash-preview
created: 2026-05-26
updated: 2026-05-26
howto: |
  1. 在 DuckDB 中新增 `alert_settings` 表格，存儲損益門檻 (P/L, P/L%)。
  2. 實作 API `GET /api/v1/settings/alerts` 與 `POST /api/v1/settings/alerts`。
  3. 實作敏感資訊讀取邏輯：
     - 優先讀取環境變數 (TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID, SMTP_SERVER, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, EMAIL_SENDER, EMAIL_RECIPIENT)。
     - 若環境變數存在，API 回傳時應遮罩或標記為「已由環境設定」，且 POST 時不寫入資料庫。
     - 若環境變數不存在，則允許從資料庫讀取/寫入（非敏感部分）。
---

# T040 - P/L Alert Configuration Backend & API

## 目標
實作損益監控告警的後端配置邏輯，支援 Email 與 Telegram 設定，並處理環境變數與資料庫之間的優先級與隱私邏輯。

## 驗收標準
- [x] DuckDB 新增 `alert_settings` 表格，包含：`pl_threshold`, `pl_percent_threshold`, `telegram_chat_id`, `email_recipient` 等.
- [x] 實作配置 API，前端可透過 API 讀取與更新告警門檻。
- [x] 敏感資訊處理：
    - 若 `TELEGRAM_BOT_TOKEN` 或 `SMTP_PASSWORD` 已在 `.env` 定義，API 不應回傳其原始值給前端。
    - 前端傳入設定時，若對應環境變數已存在，後端不得將該敏感欄位寫入資料庫。
- [x] API 回傳資訊中需包含 `is_env_set` 旗標，告知前端哪些欄位已被環境變數鎖定。

## 備註
- 這是 T041 告警發送邏輯的前提。
- 安全性：確保資料庫中不存儲明文密鑰（若非環境變數提供）。
