---
github_issue: 
title: Telegram Bot 生產部署文件與啟動腳本
type: docs
priority: low
status: pending
depends_on: []
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-06
updated: '2026-08-06'
---

# T032 - Telegram Bot 生產部署文件與啟動腳本

## 目標
T006 完成了 telegram_bot.py (FastAPI + aiogram 3 Webhook) 與 worker.py (Worker Pool)，但缺乏生產部署文件與啟動腳本。需補上：
- systemd/launchd 服務檔或 Docker Compose 生產配置
- 雙程序啟動腳本：`python telegram_bot.py` (uvicorn) + `python worker.py --workers N`
- webhook URL 設定指引：`bot.set_webhook` 指向 `/api/webhook`

## 驗收標準
- [ ] `docs/deployment/telegram-bot.md`：生產部署指南（架構圖、環境變數、啟動命令、health check）
- [ ] `scripts/start-telegram-bot.sh`：雙程序啟動腳本（含錯誤處理、日誌輸出、PID 管理）
- [ ] `docker-compose.prod.yml`：生產環境 Docker Compose（telegram_bot + worker + redis）
- [ ] Webhook 設定步驟文件：如何呼叫 `bot.set_webhook` 指向公開的 `/api/webhook`
- [ ] README 部署章節更新：連結至部署文件

## 備註
- T006 summary 後續建議第 1、2 點
- 目前 telegram_bot.py 存在但 T015 標記為「🚧 未實作」，部署文件可並行
- 需設定 `TELEGRAM_BOT_TOKEN`、`TELEGRAM_CHAT_ID`、`WEBHOOK_URL` 等環境變數