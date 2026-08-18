---
github_issue: N/A
title: Price Alerts（§36 → alert_log + 偵測）
type: task
priority: P1
status: done
depends_on: [T006, T014]
assignee: OpenCode with DeepSeek V4 Flash
created: 2026-08-18
updated: 2026-08-18
---

# T015 - Price Alerts（§36 → alert_log + 偵測）

## 目標

實作 §36 Price Alert：價格觸發條件（自訂價格 / 因子排名變動等）偵測，寫入 `alert_log`（§5.10）並與 snapshot_id 關聯（§84 #15）。純記錄 + REST 讀取，不推播（§53.1 無 SSE）。

## 驗收標準

- [x] Alert 類型：價格觸價（目標價/區間）、排名新進/跌出（進出 Top 30）、Buy Zone 狀態變化
- [x] 寫入 alert_log 表：symbol / type / trigger 描述 / triggered_at / snapshot_id（§5.10）
- [x] 偵測規則跑到 snapshot FREEZE 之前，alert 與同一 snapshot 綁定（§77.0：alert → snapshot FREEZE 順序）
- [x] alert 與「此事件是否真的發生在該 snapshot」一致（重跑不產生重複 alert，idempotent）
- [x] Alert 門檻自 `config/alerts.yaml`（或 schedule.yaml）讀取
- [x] unit test：觸發/未觸發邊界（價格剛好等於、穿越）

## 備註

- v0.3 alert 僅落庫，對外讀取走 T019 API（/api/v1/alerts）
## 完成記錄

- 交付：`alerts/`（detector.py / config.py / pipeline.py / __init__.py）+ `config/alerts.yaml`
- 測試：32 個新增（30 unit + 2 e2e live-PG）；完整套件 560 passed, 2 skipped；ruff clean
- Alert 類型（§36 + §5.10）：BUY_ZONE_1/2/3_TRIGGERED（Current Price <= Zone）、INVESTIGATE（< Bear，CRITICAL）；BUY_ZONE_STATE_CHANGE（§29 prev→curr 變化）
- 寫入 alert_log（§5.10）：snapshot_id / alert_date / symbol / alert_type / severity / payload JSONB / created_at；§36 JSON 格式 {price, threshold}（2317 例：250 vs 252）
- 執行順序（§77.0）：alert 偵測在 snapshot FREEZE 之前，alert 與同一 snapshot 綁定
- Idempotent（驗收 4）：同 snapshot 重跑 → dedupe_existing（snapshot_id + symbol + alert_type + payload_hash 比對）→ 0 重複；e2e 驗證「第一次 n 筆、重跑 0 筆」
- 門檻自 config/alerts.yaml：price_alert {enabled, mode(any_zone/lowest_zone), trigger_on_equal} + buy_zone_change {enabled} + severity 覆寫
- unit test：邊界（price == threshold 觸發/關閉、穿越 bear→Z3→Z2→Z1 順序、None price/threshold 不觸發、lowest_zone mode）、狀態變化（prev/curr None 處理）、config load、payload hash 穩定、dedupe 過濾/保留、write idempotent 重跑
