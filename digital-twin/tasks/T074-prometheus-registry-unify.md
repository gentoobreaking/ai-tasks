---
github_issue: null
title: Prometheus registry 統一（/metrics 缺 OTEL metrics）
type: refactor
priority: medium
status: done
depends_on: []
assignee: OpenCode with DeepSeek V4 Flash
created: '2026-08-12'
updated: '2026-08-17'
spec_version: v3
---
# T074 - Prometheus metrics registry 統一

## 目標
目前有兩套不相通的 metrics：
- `common/observability.py:128,144-152`：OTEL metrics（`tg_command_duration_seconds`、`rag_query_latency_seconds`）寫入自訂 `CollectorRegistry`，由 private `start_http_server` 在 `OTEL_METRICS_PORT`（預設 9464）提供
- `telegram_bot.py:166-170` `/metrics`：`generate_latest()` 使用 default registry，不含上述 OTEL metrics

文件（docs/deployment/telegram-bot.md:67,150）宣稱 `/metrics` 有 `tg_command_duration_seconds` 等，實則沒有。統一 registry 或明確分離文件。

## 驗收標準
- [x] `telegram_bot.py` `/metrics` 端點採用 observability 的 OTEL registry（或兩 registry 合併），使 OTEL 指標在 bot 的 `/metrics` 可見
- [x] 或（若採分離方案）文件明確說明哪個 port 提供哪些指標
- [x] docker/prometheus.yml scrape 目標與實際端點一致
- [x] test_observability_events / test_telegram_bot 的 metrics 測試更新並驗證真實指標內容
- [x] pytest 全量通過、ruff / pyright 通過

## 實作摘要

### 設計
`telegram_bot.py` `/metrics` 端點原先呼叫 `generate_latest()`（無 registry 參數），
使用 prometheus_client 的 **default registry**，而非 observability 初始化時建立的
`CollectorRegistry`。因此 OTEL histogram（`tg_command_duration_seconds` 等）無法在
port 8080 的 `/metrics` 見到，需等獨立 port 9464 的 `start_http_server` 才行。

### 變更
- `common/observability.py`：新增 `get_metrics_registry()`，回傳
  - `_registry`（OTEL 初始化成功時）；或
  - prometheus_client `REGISTRY`（降級模式）；或
  - `None`（prometheus_client 未安裝）
- `telegram_bot.py:metrics_text`：改為 `generate_latest(observability.get_metrics_registry())`，
  並處理 `registry is None` 的降級情況
- `tests/test_telegram_bot.py::test_metrics_endpoint`：升級為驗證 OTEL histogram
  名稱 `tg_command_duration_seconds` 出現在 `/metrics` 回應內文

### 驗證
- pytest：262 passed + 1 skipped
- ruff：All checks passed
- pyright：0 errors, 0 warnings

## 備註
- docker/prometheus.yml 仍 scrape port 9464（OTEL registry），無需改動；
  port 8080 `/metrics` 現已同樣提供 OTEL 指標，文件宣稱得以成立
- 兩 registry 皆由 `start_http_server(9464, registry=_registry)` 與 `/metrics` 端點
  共享同一 CollectorRegistry，無資料不一致風險