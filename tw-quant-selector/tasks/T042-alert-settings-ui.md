---
github_issue: https://github.com/gentoobreaking/ai-tasks/issues/720
title: 前端告警與系統設定頁面
type: feature
priority: medium
status: done
assignee: gemini-3-flash-preview
created: 2026-05-26
updated: 2026-05-26
howto: |
  1. 在 /monitor 頁面新增「系統設定」分頁或獨立的 /settings 頁面。
  2. 實作告警設定表單：門檻值、Telegram ID、Email 等。
  3. 針對環境變數鎖定的欄位，顯示為 Read-only 並標記「由環境變數設定」。
  4. 加入「發送測試告警」按鈕。
---

# T042 - Frontend Alert & System Settings UI

## 目標
實作前端設定介面，讓使用者可以直觀地配置損益告警參數與通知渠道。

## 驗收標準
- [x] 提供視覺化的門檻值設定（Input 或 Slider）。
- [x] 通知渠道設定區：
    - Telegram：輸入 Chat ID (TELEGRAM_CHAT_ID)，顯示 Token (TELEGRAM_BOT_TOKEN) 狀態（已設定/未設定）。
    - Email：輸入收件地址、SMTP 伺服器等，顯示 SMTP_PASSWORD 狀態。
- [x] 邏輯顯示：若後端回傳 `is_env_set: true`，對應輸入框應禁用 (disabled) 並顯示小圖示說明。
- [x] 點擊「儲存」時，僅發送未被環境變數鎖定的資訊。
- [x] 點擊「測試連線」按鈕，呼叫後端發送測試訊息並顯示回饋。

## 備註
- UI 需符合整體 `Financial Terminal` 設計風格。
