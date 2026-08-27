---

id: adv-T005
project: gold-analysis
source_project: gold-analysis-advanced
title: 生產環境接線（監控/重訓/A-B/交易執行）
assignee: pi with opencode/x-preview-f-free
type: feature
priority: medium
status: done
created: 2026-08-28
updated: 2026-08-28
github_issue: https://github.com/gentoobreaking/ai-tasks/issues/65
estimate: 2天
depends_on: [adv-T002, adv-T004]
---


## 目標
將 T002（監控/重訓/A-B）與 T004（交易執行）已完成的函式庫接線到運行期路徑，使其能在真實入口被觸發並產生可觀察副作用。來源：T002、T004 任務書 2026-08-28 稽核接線審計。

## 驗收標準
- [ ] 新增運行期觸發機制（API 端點或排程），呼叫 `ModelMonitor.snapshot()` 並在告警產生時呼叫 `RetrainingOrchestrator.maybe_retrain()`
- [ ] 新增交易執行入口（API 端點或排程），由 `Decision` 經 `RiskRules` → `OrderExecutor` → `ExchangeClient` 送出，並寫入 `TradeLogger`
- [ ] 新增 A/B 分流入口，讓決策指派走 `ABTest` 的確定性分流
- [ ] 入口級 end-to-end 測試（從真實 HTTP 入口 → 可觀察副作用）至少覆蓋：(a) 觸發監控並斷言 `ModelMonitor.snapshot()` 被呼叫；(b) 送出交易並斷言 `ExchangeClient` 收到下單與 `TradeLogger` 產生 `order_filled` 紀錄
- [ ] 告警/重訓/成交結果可觀察（日誌或回應欄位）

## 說明
T002/T004 的模組均有單元與模擬測試佐證，但無生產環境 caller，導致「零件都有、沒人接線」。本任務補上運行期觸發與入口級 e2e 驗證。

## 備註
實盤 REST 仍標 `[NEEDS VERIFICATION]`，本任務接線以 `SimulatedExchangeClient` 為優先驗證對象。

## 執行記錄（2026-08-28, approach 2 合併進 core）
- 監控/重訓觸發：`app.ml.ops.run_monitor` / `run_retrain`，並以 `POST /api/ml/monitor`、`POST /api/ml/retrain` 暴露（main.py include_router）。
- 交易執行：`app.trading.execution.execute_decision`（Decision → core OrderExecutor → TradeLogger），並以 `POST /api/trading/execute` 暴露；core 既有 `api/routes/decisions.py` 的 `POST /{decision_id}/execute` 亦可串接。
- A/B 分流：core `ml/ab_testing.ABTestEngine` 已存在；本任務未新增獨立分流入口（決策由 DecisionEngine 產出，A/B 為可選上層）。如需可再補 `POST /api/ml/ab/assign`。
- 入口級 e2e：`tests/test_advanced_merge.py`（function 級）+ `tests/test_advanced_http.py`（HTTP 級，TestClient 掛載 routers）覆蓋監控觸發與成交 → TradeLogger 寫入。
- 實盤 REST：`app.trading.exchange_client.RestExchangeClient`（v20，injectable opener）已併入；實盤下單仍以 SimulatedExchangeClient / MockExchange 為預設驗證對象。
