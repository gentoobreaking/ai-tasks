---
github_issue: 
title: Telegram Bot 生產部署文件與啟動腳本
type: docs
priority: low
status: done
depends_on: [T006, T015]
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-06
updated: '2026-08-09'
---

# T032 - Telegram Bot 生產部署文件與啟動腳本

## 目標
T006 完成了 telegram_bot.py (FastAPI + aiogram 3 Webhook) 與 worker.py (Worker Pool)，但缺乏生產部署文件與啟動腳本。需補上：
- systemd/launchd 服務檔或 Docker Compose 生產配置
- 雙程序啟動腳本：`python telegram_bot.py` (uvicorn) + `python worker.py --workers N`
- webhook URL 設定指引：`bot.set_webhook` 指向 `/api/webhook`

## 驗收標準
- [x] `docs/deployment/telegram-bot.md`：生產部署指南（架構圖、環境變數、啟動命令、health check）
- [x] `scripts/start-telegram-bot.sh`：雙程序啟動腳本（含錯誤處理、日誌輸出、PID 管理）
- [x] `docker-compose.prod.yml`：生產環境 Docker Compose（telegram_bot + worker + redis）
- [x] Webhook 設定文件：`scripts/set-tele-webhook.sh` + 部署文件內註冊步驟（`bot.set_webhook` 指向公開 `/api/webhook`）
- [x] README 部署章節更新：§6 連結至部署文件（並修正 T006 過時「未實作」註記）

## 備註
- T006 summary 後續建議第 1、2 點
- 目前 telegram_bot.py 存在但 T015 標記為「🚧 未實作」，部署文件可並行
- 需設定 `TELEGRAM_BOT_TOKEN`、`TELEGRAM_CHAT_ID`、`WEBHOOK_URL` 等環境變數

## 執行記錄（2026-08-09）
- 新增 `docs/deployment/telegram-bot.md`：架構圖（webhook → Redis Stream → worker pool）、環境變數表、本機/launchd/Docker 啟動、webhook 註冊、health check、疑難排解
- 新增 `scripts/start-telegram-bot.sh`：start/status/stop/restart；PID 管理於 logs/pids/；Redis 連線預檢（非致命提示）；參數陣列式傳遞
  - 踩坑：Apple bash 3.2 對 `$name（…）`（變數後緊接 CJK/全形字元）會把多語系字元併入變數名 → unbound variable；已全面改用 `${name}`/`${pid}` 明確邊界（連帶修正 set-family 其他 $var 亦一併加固）
- 新增 `scripts/set-tele-webhook.sh`：`setWebhook` 註冊 + `getWebhookInfo` 驗證；自動補 `/api/webhook` 後綴；吃 .env
- 新增 `docker-compose.prod.yml`：telegram-bot / worker（各含 healthcheck、depends_on redis healthy）、redis（AOF）
- 順帶修復 `telegram_bot.py` CLI：uvicorn 需直接執行（原 `asyncio.run(main())` 包 uvicorn 在 Python 3.14 崩潰 RuntimeError）
- README：§6 改為「已實作」+ 部署指令；架構圖、§5 樞紐、目錄樹同步修正；`.env.example` 補 `WEBHOOK_URL`
- 實測：start → status → healthz `{"status":"ok"}` → stop → status 全通過；無 Redis 環境 worker 優雅重試不崩潰
- 測試：全量 pytest 115 passed + 1 skipped（telegram_bot 19 passed）
