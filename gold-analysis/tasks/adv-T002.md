---

id: adv-T002
project: gold-analysis
source_project: gold-analysis-advanced
title: ML 模型整合與優化
assignee: pi with opencode/x-preview-f-free
type: feature
priority: low
status: done
created: 2026-04-07
updated: 2026-08-28
github_issue: https://github.com/gentoobreaking/ai-tasks/issues/63
estimate: 3天
depends_on: []
---


## 目標
將機器學習模型整合到決策系統，並進行持續優化（A/B、監控、自動重訓）。

## 驗收標準
- [x] 模型 API 封裝完成（/api/decisions/engine 回傳結構化決策：action / confidence / suggested_position_pct / top_features）
- [x] 決策系統整合完成（DecisionEngine 將 ML 預測包成 Decision，含 fallback 相容）
- [x] A/B 測試框架完成（ab_testing.ABTest：確定性分流、成效紀錄、顯著性勝者判定）
- [x] 模型監控完成（model_monitor.ModelMonitor：PSI 資料漂移、滾動準確率、延遲告警）
- [x] 自動化重訓練流程完成（retraining.RetrainingOrchestrator：監控告警/排程觸發重訓）

## 說明
- 模型整合模組：`backend/app/ml/model_integration.py`
- A/B 測試框架：`backend/app/ml/ab_testing.py`
- 模型監控模組：`backend/app/ml/model_monitor.py`
- 自動重訓：`backend/app/ml/retraining.py`

## 備註
需確保模型預測結果與現有決策系統的兼容性。

## 執行紀錄（2026-08-28 稽核）
- 已達成 5 項並打勾；證據：實作 `backend/app/ml/{model_integration,ab_testing,model_monitor,retraining}.py` 與 `POST /api/decisions/engine`；測試 `tests/test_integration.py`、ML 管線測試。
- 接線審計發現：`DecisionEngine` 已由 `/api/decisions/engine` 呼叫（生產接線 ✅）；但 `ABTest` / `ModelMonitor` / `RetrainingOrchestrator` 目前**無生產環境 caller**（無排程/端點觸發），僅有單元測試，屬跨任務整合缺口，已回流為 T005。
- 未竟事項：監控/重訓/A-B 的運行期觸發與告警投遞未接線（見 T005）。
