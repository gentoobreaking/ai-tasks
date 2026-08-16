---
status: done
spec_version: v3
commit: a1c28f0
depends_on: []
priority: high
commit: ddddf62
assignee: OpenCode
created: 2026-08-03
updated: 2026-08-06
---
# T005: 新增 common/observability.py 統一結構化日誌與 OpenTelemetry

## 背景
專案僅有 `console.log` / `print`，無結構化日誌、無指標、無追蹤（v3 討論 2.6, DEC-06）。

## 需求
1. 新增 `common/observability.py`：
   - [x] `init_otel(service_name)`：統一初始化 OTEL（ConsoleSpanExporter + PrometheusMetricReader + /metrics 9464,可經 OTEL_METRICS_PORT 覆寫;0 = 停用）
   - [x] `structlog` JSON stdout 輸出（level/timestamp/logger 欄位齊全）
   - [x] OpenTelemetry: ConsoleSpanExporter + PrometheusMetricReader
   - [x] 提供 `get_logger()`, `get_meter()` 供各腳本導入
2. 在關鍵腳本植入：
   - [x] `multi_ai_discuss.py`：每輪耗時、token 使用量（估算 1 token≈4 字元）
   - [ ] `telegram_bot.py`：命令耗時、錯誤計數 ← 檔案不存在（T006 失敗已移除），指標建構已預留，植入待 T006 重啟
   - [x] `index_knowledge.py`：查詢延遲
   - [x] `apply_feedback.py`：反饋套用耗時（指標完整性補強）
3. 關鍵指標：
   - [x] `discussion_round_duration_seconds{model,round}`
   - [x] `rag_query_latency_seconds{version:v1}`
   - [x] `feedback_apply_duration_seconds{agent,version:v1}`
   - [x] `tg_command_duration_seconds{command,role}`（建構已預留，待 T006）

## 驗收標準
- [x] 所有腳本啟動時呼叫 `init_otel()`
- [x] 結構化 JSON 日誌輸出至 stdout
- [x] `/metrics` endpoint 可被 Prometheus 抓取（實測抓取 `rag_query_latency_seconds_count{version="v1"} 1.0`）

## 決策與註記
- OTEL/Prometheus 依賴為**可選**：未安裝時自動降級為純 structlog JSON（系統 python 實測正常）
- /metrics port 占用時降級警告而非崩潰（三腳本並發實測正常）
- pyproject 依賴 / Dockerfile builder 階段同步補 OTEL 套件；HEALTHCHECK 納入 common.observability
- 升級期間改用 `~/.venv`（Python 3.14.6）驗證（此前 3.12 自帶 python 的依賴缺失問題記錄於 T008/T009 背景）

## 驗證記錄（2026-08-06）
- `pytest` 5 passed
- 三腳本實跑：JSON 日誌 + metrics server 正常輸出
- 單進程抓取 /metrics：`rag_query_latency_seconds_count{otel_scope_name="e2e-test",version="v1"} 1.0` + `_sum 0.14`
- 降級模式（/opt/homebrew/bin/python3 無 OTEL）正常
- ruff 新增錯誤 0（既有 23 個 E501/SIM 未動）

## 參考
- v3 討論 DEC-06 / SPEC-05 / DeepSeek 第 2 輪建議 2.3, 2.6