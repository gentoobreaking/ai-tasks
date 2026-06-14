---
github_issue: https://github.com/openclawchen8-lgtm/openclaw-tasks/issues/723
title: 實作即時損益監控 (Live P/L Monitoring)
type: feature
priority: high
status: done
assignee: gemini-3-flash-preview
created: 2026-05-29
updated: 2026-05-29
howto: 使用 scripts/export_portfolio.py 與 scripts/check_live_alerts.py
---

# T082 - 實作即時損益監控 (Live P/L Monitoring)

## 目標
透過 TWSE 即時 API 定期檢查持股損益，並於觸發報酬率或損益金額門檻時，透過 Alerting 系統發送即時通知。

## 驗收標準
- [x] 建立 portfolio 資料表存儲實際持股
- [x] 實作 scripts/export_portfolio.py 導出監控清單
- [x] 實作 scripts/check_live_alerts.py 對接 TWSE MIS API 並計算損益
- [x] 驗證 AlertManager 整合，支援冷卻時間與通知發送

## 備註
- 建議設定 Cron Job 在開盤時間 (09:00-13:30) 每 10-15 分鐘執行一次。
