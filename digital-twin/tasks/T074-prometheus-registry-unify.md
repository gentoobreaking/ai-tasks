---
github_issue: null
title: Prometheus registry 統一（/metrics 缺 OTEL metrics）
type: refactor
priority: medium
status: pending
depends_on: []
assignee: OpenCode with DeepSeek V4 Flash
created: '2026-08-12'
updated: '2026-08-12'
---
# T074 - Prometheus metrics registry 統一

## 目標
目前有兩套不相通的 metrics：
- `common/observability.py:128,144-152`：OTEL metrics（`tg_command_duration_seconds`、`rag_query_latency_seconds`）寫入自訂 `CollectorRegistry`，由 private `start_http_server` 在 `OTEL_METRICS_PORT`（預設 9464）提供
- `telegram_bot.py:166-170` `/metrics`：`generate_latest()` 使用 default registry，不含上述 OTEL metrics

文件（docs/deployment/telegram-bot.md:67,150）宣稱 `/metrics` 有 `tg_command_duration_seconds` 等，實則沒有。統一 registry 或明確分離文件。

## 驗收標準
- [ ] `telegram_bot.py` `/metrics` 端點採用 observability 的 OTEL registry（或兩 registry 合併），使 OTEL 指標在 bot 的 `/metrics` 可見
- [ ] 或（若採分離方案）文件明確說明哪個 port 提供哪些指標
- [ ] docker/prometheus.yml scrape 目標與實際端點一致
- [ ] test_observability_events / test_telegram_bot 的 metrics 測試更新並驗證真實指標內容
- [ ] pytest 全量通過、ruff / pyright 通過

## 備註
- 現有 test_metrics_endpoint 斷言過於寬鬆（見 review），T078 一併收緊；本任務聚焦 registry 正確性