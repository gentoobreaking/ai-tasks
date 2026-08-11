---
github_issue: null
title: telegram webhook secret token 驗證（防偽造 Update 繞過 RBAC）
type: security
priority: high
status: done
depends_on: []
assignee: OpenCode with DeepSeek V4 Flash
created: '2026-08-12'
updated: '2026-08-12'
---
# T070 - telegram webhook secret token 驗證

## 目標
`/api/webhook` 目前對任何 POST 都接受並餵給 aiogram，攻擊者若得知公開 webhook 網址即可偽造 Telegram Update（例如偽造 admin user_id 的 /discuss），繞過 RBAC。

Telegram 官方支援 `secret_token`（setWebhook 時設定，之後每筆 Update 帶 `X-Telegram-Bot-Api-Secret-Token` header）。本任務加入此驗證。

## 驗收標準
- [x] 設定 `TELEGRAM_WEBHOOK_SECRET` 後，`/api/webhook` 校驗 `X-Telegram-Bot-Api-Secret-Token` header
- [x] header 缺失或不符 → 401 拒絕（不餵入 aiogram）
- [x] header 相符 → 正常處理
- [x] 未設定 secret 時維持原行為（向後相容，不拒絶）
- [x] 註冊流程（set-tele-webhook.sh）與設定文件同步更新
- [x] 新增測試涵蓋 4 情境；pytest 全量通過

## 實作摘要（2026-08-12）
- `telegram_bot.py`：
  - 新增 `WEBHOOK_SECRET`（env `TELEGRAM_WEBHOOK_SECRET`）與 `WEBHOOK_SECRET_HEADER` 常數。
  - `/api/webhook` 開頭：`WEBHOOK_SECRET` 非空時比對 header（`hmac.compare_digest` 恆定時間），不符 → 401 `{"ok": false}`；相符才繼續讀 body 餵 aiogram。
  - 未設定 secret 時完全維持原行為。
- `scripts/set-tele-webhook.sh`：`setWebhook` 呼叫時若 `TELEGRAM_WEBHOOK_SECRET` 非空，自動加 `--data-urlencode secret_token=...`（官方參數，之後 Update 即帶對應 header）。
- `.env.example`：新增 `TELEGRAM_WEBHOOK_SECRET` 欄位與註解。
- `docker-compose.prod.yml`：telegram-bot 服務透傳 `TELEGRAM_WEBHOOK_SECRET=${TELEGRAM_WEBHOOK_SECRET:-}`。
- `tests/test_telegram_bot.py`（+4）：缺 header 401／錯誤 secret 401／正確 secret 通過（200/500 非 401）／未設定不拒絶。
- 全量 pytest 258 passed、ruff 通過。pyright 對 telegram_bot.py 無錯誤（測試檔 7 個 errors 為既有 circuit-breaker 存量，非本任務引入，git stash 驗證）。
- commit: `e16b61d`
