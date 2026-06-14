---
github_issue: https://github.com/openclawchen8-lgtm/openclaw-tasks/issues/688
title: 個股損益告警觸發 API
type: feature
priority: high
status: done
assignee: OpenCode DeepSeek V4 Flash
created: 2026-05-27
updated: 2026-05-27
howto: |
  1. 新增 API `POST /api/v1/portfolio/alert`，接收 stock_id、pnl、pnl_pct、avg_cost、current_price、shares。
  2. 整合既有 `send_notification()` 發送 Telegram + Email。
  3. 實作 stock_id 層級 4 小時 cooldown（沿用 T041 機制）。
  4. 記錄觸發至 alert_log 表或日誌檔。
  5. alert_enabled=false 時直接跳過不發送。
---

# T045 - 個股損益告警觸發 API（後端）

## 目標
實作前端 Portfolio 主動觸發告警的 API 端點，當前端偵測到個股損益超標時，呼叫此 API 經由既有的 Telegram/Email 通知管道發送告警。

## 驗收標準
- [ ] `POST /api/v1/portfolio/alert` 接受 JSON body：
  ```json
  {
    "stock_id": "2330",
    "stock_name": "台積電",
    "pnl": 70000,
    "pnl_pct": 7.0,
    "threshold_type": "percent",
    "threshold_value": 5.0,
    "avg_cost": 8500000,
    "current_price": 920,
    "shares": 10
  }
  ```
- [ ] 呼叫既有 `send_notification()` 發送 Telegram + Email
- [ ] 通知訊息包含：股票名稱/代號、損益金額/百分比、門檻值、均價、現價、持有張數
- [ ] 實作 stock_id 層級 cooldown（4小時內同一 stock_id 不重複發送）
- [ ] 若該 stock_id 的 `alert_enabled` 為 false，則直接略過不回 notification
- [ ] 每次觸發記錄到 `alert_log` 表：stock_id、觸發時間、pnl、threshold、是否已發送
- [ ] 回傳 `{ sent: true, cooldown_until: "..." }` 或 `{ sent: false, reason: "cooldown" }`

## 備註
- 此 API 由前端 Portfolio 頁面在偵測到超標時主動呼叫，後端不做輪詢
- 重用 T040/T041/T042 的現有 `send_notification()`、`alert_settings` 表、cooldown 邏輯
- 若 T041 的 `check_pl_alerts()` stub 未來實作，應與此 API 共用 cooldown 狀態
