---
github_issue: ""
title: "[Phase 1] 訊號輸出、通知與紀錄"
type: feature
priority: medium
status: done
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-07-30
updated: 2026-07-30
---

# T005 - 訊號輸出與通知

## 目標
每日盤後自動產出訊號報告，透過即時通訊推播給使用者，並保留完整的訊號歷史紀錄供後續分析。

對應規格：`§3.1.5 通知`、`§3.1.2 訊號輸出與紀錄`

## 驗收標準
- [x] 每日收盤後自動執行完整 Pipeline — cron 15:00 weekday / `python -m tw_quant_signal.pipeline`
- [x] 產出 Markdown / CSV 格式的訊號報告 — `data/reports/report_{date}.md` + `signals_{date}.csv`
- [x] 透過 Telegram Bot API 推播每日訊號摘要 — `send_rules_report()` + `build_daily_report()` (需設 `TELEGRAM_BOT_TOKEN` / `TELEGRAM_CHAT_ID`)
- [x] 或使用 Discord Webhook 作為替代通知管道 — `_send_discord()` fallback (需設 `DISCORD_WEBHOOK_URL`)
- [x] 所有訊號輸出記錄至 DB，可供查詢與回溯 — `rule_signals` + `pipeline_log` 表
- [x] 資料管線異常時主動告警 — 抓取失敗標記 fail、筆數異常比對 WATCH_STOCKS 數量
- [x] 設定明確的準時率與資料完整率目標 — `pipeline_log` 追蹤準時率 (cron 定時) + 完整率 (ok/fail ratio)

## 備註
- LINE Notify 已於 2025/3 停止服務，勿使用
- Telegram Bot API 免費且訊息量無上限
