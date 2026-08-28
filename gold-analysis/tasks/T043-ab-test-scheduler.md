---
id: T043
project: gold-analysis
source_project: gold-analysis-advanced
title: A/B 分流入口與週期排程
assignee: "pi with opencode/x-preview-f-free"
priority: medium
type: feature
status: done
created: 2026-08-28
updated: 2026-08-28
depends_on:
  - T020
github_issue: https://github.com/gentoobreaking/ai-tasks/issues/65
---

## 目標
補上 adv-T005 未完成的 A/B 分流入口，並為監控/重訓/交易執行加上週期排程（APScheduler/cron），使其能定時自動觸發而非僅靠手動 HTTP 呼叫。

## 驗收標準
- [x] 新增 `POST /api/ml/ab/assign` 端點，輸入 `user_id`/`symbol`，輸出 `ab_test` 分流結果（variant A/B），使用 core `ml/ab_testing.ABTestEngine` 的確定性分流邏輯
- [x] 為 `run_monitor`/`run_retrain`/`execute_decision` 加上 APScheduler 週期任務：
  - `run_monitor`：每 15 分鐘執行一次（可配置）
  - `run_retrain`：每日 02:00 執行（可配置），僅在觸發條件（漂移/準確率下降/排程）滿足時真正重訓
  - `execute_decision`：不直接排程（由決策引擎觸發），但提供排程決策生成的入口（如每 5 分鐘跑一次推薦）
- [x] 排程配置可透過環境變數或 settings 調整（cron 表達式或 interval）
- [x] 入口級 e2e 測試：啟動排程器 → 等待一次觸發 → 斷言 `ModelMonitor.snapshot()` 被呼叫、重訓邏輯被評估、`ABTestEngine.assign()` 回傳確定性結果

## 備註
- core `ml/ab_testing.ABTestEngine` 已存在（`assign(user_id, symbol) -> variant`），只需暴露 HTTP 入口
- APScheduler 需加入依賴（`pip install apscheduler`），並在 app 啟動時啟動/關閉
- `run_retrain` 的排程觸發應檢查 `trigger` 參數（cron/手動/漂移），避免無條件重訓
- 實盤 REST 仍標 `[NEEDS VERIFICATION]`，本任務以 SimulatedExchangeClient 為驗證對象