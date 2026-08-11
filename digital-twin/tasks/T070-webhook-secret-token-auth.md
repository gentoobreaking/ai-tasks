---
github_issue: null
title: telegram webhook 加入 X-Telegram-Bot-Api-Secret-Token 驗證（防偽造更新）
type: fix
priority: high
status: pending
depends_on: []
assignee: OpenCode with DeepSeek V4 Flash
created: '2026-08-12'
updated: '2026-08-12'
---
# T070 - telegram webhook secret token 驗證

## 目標
`telegram_bot.py:377-386` 的 webhook 端點直接信任 `request.json()`，未驗證 Telegram 的 `X-Telegram-Bot-Api-Secret-Token` header；`feed_update`（:249-264）的 RBAC 完全由 payload 內 `from_user.id`（:280-291）決定。公開端點 + 偽造符合 admin/operator whitelist 的 `from_user.id` 即可繞過 RBAC、觸發 `/discuss`/`/rag`。加入 secret token 驗證。

## 驗收標準
- [ ] webhook 端點驗證 `X-Telegram-Bot-Api-Secret-Token` header，與 config 中設定的 secret 比對
- [ ] secret 由環境變數提供（如 `TELEGRAM_WEBHOOK_SECRET`，收斂至 config.py）；未設定時的行為明確（建議：公開環境必須設定，未設定則一律拒收或函示方案）
- [ ] 缺 header / 錯誤 token → 403（或 401），且不處理 body
- [ ] `.env.example` 補上變數說明
- [ ] 新增測試：正確 token 接受、錯誤/missing token 拒絕
- [ ] 既有 test_telegram_bot.py 的 webhook 測試相應更新，pytest 全量通過

## 備註
- 資安修正，優先級高
- 設定方式請與 Telegram Bot API 的 setWebhook `secret_token` 參數對應（文件注明），避免誤配