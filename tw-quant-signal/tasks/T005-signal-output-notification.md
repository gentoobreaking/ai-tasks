---
github_issue: ""
title: "[Phase 1] 訊號輸出、通知與紀錄"
type: feature
priority: medium
status: pending
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-07-30
updated: 2026-07-30
---

# T005 - 訊號輸出與通知

## 目標
每日盤後自動產出訊號報告，透過即時通訊推播給使用者，並保留完整的訊號歷史紀錄供後續分析。

對應規格：`§3.1.5 通知`、`§3.1.2 訊號輸出與紀錄`

## 驗收標準
- [ ] 每日收盤後自動執行完整 Pipeline
- [ ] 產出 Markdown / CSV 格式的訊號報告
- [ ] 透過 Telegram Bot API 推播每日訊號摘要
- [ ] 或使用 Discord Webhook 作為替代通知管道
- [ ] 所有訊號輸出記錄至 DB，可供查詢與回溯
- [ ] 資料管線異常時主動告警（抓取失敗、筆數異常）
- [ ] 設定明確的準時率與資料完整率目標

## 備註
- LINE Notify 已於 2025/3 停止服務，勿使用
- Telegram Bot API 免費且訊息量無上限
