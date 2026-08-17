---
github_issue: N/A
title: Price Alerts（§36 → alert_log + 偵測）
type: task
priority: P1
status: pending
depends_on: [T006, T014]
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-18
updated: 2026-08-18
---

# T015 - Price Alerts（§36 → alert_log + 偵測）

## 目標

實作 §36 Price Alert：價格觸發條件（自訂價格 / 因子排名變動等）偵測，寫入 `alert_log`（§5.10）並與 snapshot_id 關聯（§84 #15）。純記錄 + REST 讀取，不推播（§53.1 無 SSE）。

## 驗收標準

- [ ] Alert 類型：價格觸價（目標價/區間）、排名新進/跌出（進出 Top 30）、Buy Zone 狀態變化
- [ ] 寫入 alert_log 表：symbol / type / trigger 描述 / triggered_at / snapshot_id（§5.10）
- [ ] 偵測規則跑到 snapshot FREEZE 之前，alert 與同一 snapshot 綁定（§77.0：alert → snapshot FREEZE 順序）
- [ ] alert 與「此事件是否真的發生在該 snapshot」一致（重跑不產生重複 alert，idempotent）
- [ ] Alert 門檻自 `config/alerts.yaml`（或 schedule.yaml）讀取
- [ ] unit test：觸發/未觸發邊界（價格剛好等於、穿越）

## 備註

- v0.3 alert 僅落庫，對外讀取走 T019 API（/api/v1/alerts）