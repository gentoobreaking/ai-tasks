---
github_issue: ""
title: "Prometheus metrics endpoint: /api/metrics"
type: pending
priority: medium
status: done
depends_on: []
assignee: "OpenCode with DeepSeek V4 Flash"
created: "2026-08-22"
updated: "2026-08-22"
---

# T093 - Prometheus metrics endpoint: /api/metrics

## 目標
暴露 Prometheus 格式的指標端點，支援 Grafana 監控儀表板、告警規則。

## 驗收標準
- [x] `GET /api/metrics` 回傳 `text/plain; version=0.0.4; charset=utf-8` 格式
- [x] 核心指標：
  - `freemodel_models_up{provider,model}` (gauge) — 模型存活狀態 1/0
  - `freemodel_model_latency_ms{provider,model}` (gauge) — 平均延遲
  - `freemodel_model_uptime{provider,model}` (gauge) — 可用率百分比
  - `freemodel_requests_total{provider,model,status}` (counter) — 請求總數
  - `freemodel_request_duration_ms{provider,model}` (histogram) — 請求延遲分布
  - `freemodel_active_models` (gauge) — 當前 up 模型數
  - `freemodel_total_models` (gauge) — 註冊模型總數
  - `freemodel_ping_failures_total{provider,model}` (counter) — ping 失敗計數
- [x] 使用 `prometheus/client_golang` 標準庫（新增依賴）
- [x] 指標更新頻率：ping 引擎每輪更新、router 每請求更新
- [x] `/api/meta` 包含 `metricsEndpoint: "/api/metrics"`
- [x] 單元測試驗證指標格式正確性

## 備註
- 修改位置：`internal/router/server.go`（新增 handler）、`internal/ping/engine.go`（暴露指標更新）、`internal/router/routing.go`（請求指標）
- 新增 `internal/metrics` 套件集中管理指標定義與註冊
- 避免記憶體洩漏：histogram buckets 固定、label cardinality 控制（provider+model 約 130 個）
- 建議 buckets：`[50, 100, 200, 500, 1000, 2000, 5000, 10000, 30000, 60000]`（ms）
- Docker/Prometheus 整合：在 docker-compose.yml 添加 prometheus scrape config 範例