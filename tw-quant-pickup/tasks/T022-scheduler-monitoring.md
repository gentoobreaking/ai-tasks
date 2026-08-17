---
github_issue: N/A
title: Scheduler 與 Monitoring / Health（§49 / §54–55）
type: task
priority: P1
status: pending
depends_on: [T019, T020]
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-18
updated: 2026-08-18
---

# T022 - Scheduler 與 Monitoring / Health（§49 / §54–55）

## 目標

實作每日 pipeline 排程（§49：盤後自動執行整條流程）與監控（§55）、Health Check（§54）。Sprint 8 前半：Scheduler + Monitoring。

## 驗收標準

- [ ] Daily Pipeline（§49）完整順序可自動執行：collect → validate → factors → valuation → ranking → alert → snapshot FREEZE → AI → report（§77.0 依賴圖順序）
- [ ] 排程器（cron / APScheduler）執行時間對齊 §49（盤後，法人 15:00 後）
- [ ] 任一步驟失敗：重試策略 + 停止後續（不產出半成品 snapshot）；告警記錄
- [ ] `/health`（§54）如 T019 所定義並持續可用
- [ ] Monitoring（§55）：log（關鍵步驟時長 / 資料量 / 失敗率）、指標可被 Prometheus 或文件化欄位讀取
- [ ] 階段斷路器：前一步資料未達標（如 validation critical error）不進入下一步計算（§62）
- [ ] Alerts（系統健康，非價格）可通知（log / 外部 hook），與價格 alert（T015）分離

## 備註

- Monitoring 不收集任何使用者/交易敏感資料（§58）
- schedule.yaml 為排程參數唯一來源（§4 config）