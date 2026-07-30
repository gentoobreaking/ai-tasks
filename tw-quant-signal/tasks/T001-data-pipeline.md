---
github_issue: ""
title: "[Phase 1] 資料管線建置 — 擷取、清洗、儲存、健康檢查"
type: feature
priority: high
status: done
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-07-30
updated: 2026-07-30
---

# T001 - 資料管線建置

## 目標
建立可自動每日執行的資料管線，從 TWSE OpenAPI 擷取 OHLCV、三大法人買賣超等資料，經清洗後存入本地資料庫（SQLite / PostgreSQL），並具備資料完整性檢查與異常告警機制。

對應規格：`§3.1.3 資料需求與來源`、`§3.1.5 技術建議`

## 驗收標準
- [x] 加權指數 OHLCV 可每日自動從 TWSE OpenAPI 取得並存入 DB
- [x] 三大法人買賣超資料可每日取得（T-1 盤後資料）
- [x] 個股（台積電 2330）OHLCV 可每日取得
- [x] 除權息還原邏輯正確實作
- [x] 技術指標（MA、均量、RSI、布林通道）由內部自行計算，不依賴第三方 API
- [x] 資料管線健康檢查：抓取失敗、筆數異常時主動通知（Telegram Bot / Discord Webhook）
- [x] 每日排程以 cron / systemd timer 執行
- [x] 資料至少覆蓋 5 年歷史

## 備註
- 與既有台股分析管線高度重疊，建議直接沿用，避免重工
- 融資融券資料排第二階段導入
- 避免未來函數：確保法人資料使用 T-1 已公布值
