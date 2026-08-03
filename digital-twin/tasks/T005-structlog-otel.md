---
status: in-progress
priority: high
assignee: OpenCode
created: 2026-08-03
updated: '2026-08-03'
---
# T005: 新增 common/observability.py 統一結構化日誌與 OpenTelemetry

## 背景
專案僅有 `console.log` / `print`，無結構化日誌、無指標、無追蹤（v3 討論 2.6, DEC-06）。

## 需求
1. 新增 `common/observability.py`：
   - `init_otel(service_name)`：統一初始化 OTEL
   - `structlog` JSON stdout 輸出
   - OpenTelemetry: ConsoleSpanExporter + PrometheusMetricReader
   - 提供 `get_logger()`, `get_meter()` 供各腳本導入
2. 在關鍵腳本植入：
   - `multi_ai_discuss.py`：每輪耗時、token 使用量
   - `telegram_bot.py`：命令耗時、錯誤計數
   - `index_knowledge.py`：查詢延遲
3. 關鍵指標（見 v3 討論 2.6）：
   - `discussion_round_duration_seconds{model,round}`
   - `rag_query_latency_seconds{version}`
   - `feedback_apply_duration_seconds{agent,version}`
   - `tg_command_duration_seconds{command,role}`

## 驗收標準
- 所有腳本啟動時呼叫 `init_otel()`
- 結構化 JSON 日誌輸出至 stdout
- `/metrics` endpoint 可被 Prometheus 抓取

## 參考
- v3 討論 DEC-06 / SPEC-05 / DeepSeek 第 2 輪建議 2.3, 2.6