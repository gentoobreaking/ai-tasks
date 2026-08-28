---
github_issue: https://github.com/gentoobreaking/ai-tasks/issues/260
title: 新增多管道通知支援 (Discord / Telegram / Email)
github_issue: https://github.com/gentoobreaking/ai-tasks/issues/260
/title: 新增多管道通知支援 (Discord / Telegram / Email)
/status: done
assignee: 寶寶
---

## 目標

目前 alert 僅輸出到 stdout。新增多管道通知支援，使監控結果可即時通知到 Discord、Telegram、Email。

## 設計

### Config schema 擴充

```json
{
  "notifications": {
    "discord": {
      "enabled": false,
      "webhook_url": "https://discord.com/api/webhooks/..."
    },
    "telegram": {
      "enabled": false,
      "bot_token": "...",
      "chat_id": "..."
    },
    "email": {
      "enabled": false,
      "smtp_host": "...",
      "smtp_port": 587,
      "username": "...",
      "password": "...",
      "from": "...",
      "to": "..."
    }
  }
}
```

### 通知流程

- Alert 觸發時，依序嘗試各啟用的 channel
- 單一 channel 失敗不影響其他 channel
- 敏感資訊 (token/password) 應從環境變數讀取，不存入 config.json

## 驗證標準

- [x] Discord webhook 發送成功，訊息包含金屬標籤 + 價格變動
- [x] Telegram bot 發送成功
- [x] Email 發送成功
- [x] 單一 channel 失敗不影響其他 channel
- [x] 敏感資訊不寫入 config.json（從環境變數讀取）
