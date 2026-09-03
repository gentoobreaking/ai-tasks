---
github_issue: ""
title: "backfill: add HTTP API endpoint to trigger/check backfill status"
type: feature
priority: high
status: done
depends_on: ["T037"]
assignee: "pi"
created: "2026-09-02T04:40:28Z"
updated: "2026-09-02T05:45:00Z"
---

# T038 - backfill: add HTTP API endpoint to trigger/check backfill status

## 目標
為 tw-quant-db/backfill 新增 HTTP API 服務，供 tw-quant-pickup scheduler 呼叫，實現方案 B3：scheduler 透過 HTTP 觸發 backfill、輪詢狀態、確認完成後再跑 pipeline。

## 驗收標準
- [x] 新增 HTTP server (Gin/Echo) 於 backfill/main.go，預設 port 8080
- [x] POST /api/v1/backfill/trigger - 觸發回補（非阻塞，返回 job_id）
  - 參數: range (如 "5Y"), resume (bool), stocks (可選)
  - 返回: {job_id, status: "started"}
- [x] GET /api/v1/backfill/status/{job_id} - 查詢回補狀態
  - 返回: {job_id, status: "running|completed|failed", progress, total_stocks, completed_stocks, current_stock, error}
- [x] GET /api/v1/backfill/latest - 查詢最近一次回補結果
  - 返回: {job_id, status, completed_at, total_rows, completion_pct}
- [x] 健康檢查端點: GET /health
- [x] 背景 worker 執行實際回補邏輯（複用既有 runBackfill）
- [x] Job 狀態持久化到記憶體/檔案（支援重啟恢復）
- [x] 程式碼編譯通過 `go build -o backfill .`
- [x] 測試：curl 觸發 → 輪詢狀態 → 完成

## 備註
- 此任務配合 tw-quant-pickup T048 (scheduler 整合 HTTP 呼叫)
- API 設計參考 spec §54 規範（Response Envelope: {data, meta, error}）
- 現有 CLI 模式保持不變（向後相容）
- 考慮並發控制：同時間只允許一個 backfill job 執行