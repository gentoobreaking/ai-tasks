---
github_issue: ""
title: "scheduler: integrate HTTP API to trigger backfill before daily pipeline"
type: feature
priority: high
status: done
depends_on: ["tw-quant-db/T038"]
assignee: "pi"
created: "2026-09-02T04:40:28Z"
updated: "2026-09-02T06:30:00Z"
---

# T048 - scheduler: integrate HTTP API to trigger backfill before daily pipeline

## 目標
修改 tw-quant-pickup cli/scheduler.py，在每日 pipeline 執行前（_run_daily_pipeline），透過 HTTP API 呼叫 tw-quant-db backfill 服務：
1. 觸發 backfill 回補（POST /api/v1/backfill/trigger）
2. 輪詢狀態直到完成（GET /api/v1/backfill/status/{job_id}）
3. 確認完成且有今日收盤價後，才繼續執行 8 階段 pipeline
4. 失敗時發送 alert_pipeline_failed，不產出半成品 snapshot

## 驗收標準
- [x] 新增 _ensure_daily_prices_ready(market_date) 方法
  - 呼叫 backfill HTTP API: POST http://tw-quant-backfill:8080/api/v1/backfill/trigger
  - 參數: {"range": "5Y", "resume": true}
  - 取得 job_id
- [x] 新增 _poll_backfill_status(job_id) 方法
  - 輪詢 GET http://tw-quant-backfill:8080/api/v1/backfill/status/{job_id}
  - 間隔 10 秒，最多等待 600 秒 (10 分鐘)
  - 狀態為 "completed" 才返回成功
  - 狀態為 "failed" 或超時拋出異常
- [x] 修改 _run_daily_pipeline() 在開頭呼叫 _ensure_daily_prices_ready(date.today())
- [x] 成功後，二次確認 core.daily_prices 有今日收盤價
- [x] 失敗時觸發 alert_pipeline_failed (stage="backfill", error=...)
- [x] 環境變數設定 BACKFILL_API_URL (預設 http://tw-quant-backfill:8080)
- [x] 單元測試：mock HTTP 回應驗證流程
- [x] 整合測試：與真實 backfill 服務配合（需 T038 完成）

## 備註
- 此任務依賴 tw-quant-db T038 (backfill HTTP API 完成)
- 方案 B3：HTTP API 解耦，scheduler 與 backfill 容器解耦、可跨主機
- 環境變數 BACKFILL_API_URL 在 docker-compose.yml 設定
- 保留原有 CLI --once/--dry-run 行為不變
- timeout 設定：觸發 30s、輪詢間隔 10s、總超時 600s
- 新增 --skip-backfill 參數供測試/緊急使用
