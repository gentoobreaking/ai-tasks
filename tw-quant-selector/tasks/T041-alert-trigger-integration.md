---
github_issue: https://github.com/gentoobreaking/ai-tasks/issues/719
title: 損益告警觸發邏輯與 Telegram/Email 整合
type: feature
priority: high
status: done
assignee: gemini-3-flash-preview
created: 2026-05-26
updated: 2026-05-26
howto: |
  1. 在監控模組中新增 P/L 檢查邏輯。
  2. 串接 Telegram Bot API 發送訊息 (使用 TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID)。
  3. 串接 SMTP 服務發送 Email (使用 SMTP_SERVER, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, EMAIL_SENDER, EMAIL_RECIPIENT)。
  4. 實作告警冷卻機制 (Cooldown)，避免短時間重複發送。
---

# T041 - P/L Alert Triggering & Multi-channel Integration

## 目標
實作實際的告警檢查與發送邏輯，當投組損益超過 T040 設定的門檻時，透過 Telegram 與 Email 發送通知。

## 驗收標準
- [x] 監控排程能計算當前投組的總損益與損益 %。
- [x] 當數值超過設定門檻時，觸發告警：
    - Telegram：發送至指定的 Chat ID。
    - Email：發送至指定的收件地址。
- [x] 告警訊息需包含：股票清單摘要、當前損益、觸發時間、超出門檻值。
- [x] 實作 Cooldown 邏輯（如：同一個告警在 4 小時內僅發送一次）。
- [x] 支援測試模式 API：`POST /api/v1/settings/test-alert`，模擬發送測試訊息。

## 備註
- 需處理網路連線異常，若發送失敗應記錄於操作日誌 (T024)。
